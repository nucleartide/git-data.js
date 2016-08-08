
const Blob = require('./blob')
const JSONBlob = require('./json-blob')
const co = require('co')
const {
  merge,
  startsWith,
  endsWith,
  basename,
  isDirectChild,
  removeElement,
  dirname,
} = require('./util')
require('./promise')

module.exports = class Repo {

  /**
   * Initialize a repo with an owner, a repo, and a branch.
   */

  constructor(opts = {}) {
    this.github = opts.github
    this.owner = opts.owner
    this.repo = opts.repo
    this.branch = opts.branch
    this.commitPrefix = opts.commitPrefix || ''

    this._blobCache = {}
    this._treeCache = null
  }

  static detectFileType(path) {
    if (endsWith(path, '.json')) return JSONBlob
    return Blob
  }

  /**
   * Wrap GitHub methods such that owner and repo are passed in automatically.
   */

  _wrapGithub(method, opts = {}) {
    const args = {}
    merge(args, { owner: this.owner, repo: this.repo })
    merge(args, opts)
    return this.github[method](args)
  }

  /**
   * Retrieve the API response for the repo's root tree.
   */

  _treeRes() { return co(function*(){
    if (this._treeCache) return this._treeCache

    const ref = yield this._wrapGithub('getReference', { ref: this.branch })
    const commitSHA = ref.object.sha
    const commit = yield this._wrapGithub('getCommit', { sha: commitSHA })
    const treeSHA = commit.tree.sha

    this._treeCache = yield this._wrapGithub('getTree', {
      sha: treeSHA,
      recursive: true
    })

    return this._treeCache
  }.bind(this)) }

  /**
   * Read a file from the Git repository.
   */

  readFile(path = '', FileType = Repo.detectFileType(path)) { return co(function*(){
    if (path in this._blobCache) return this._blobCache[path]

    const tree = yield this._treeRes()
    const info = tree.tree.find(info =>
      info.path === path &&
      info.type === 'blob')
    if (!info) throw new Error(`File "${path}" was not found.`)

    const res = yield this._wrapGithub('getBlob', { sha: info.sha })
    const json = {}
    merge(json, info)
    merge(json, res)

    const b = new FileType(json)
    this._blobCache[path] = b
    return b
  }.bind(this)) }

  /**
   * Create a file. If the file exists, the existing file will be returned
   * instead.
   */

  createFile(path = '', FileType = Repo.detectFileType(path)) {
    if (path in this._blobCache) return Promise.resolve(this._blobCache[path])

    return co(function*(){
      const tree = yield this._tree()
      const info = tree.tree.find(info =>
        info.path === path &&
        info.type === 'blob')

      if (info) {
        const res = yield this.github('getBlob', { sha: info.sha })
        const json = {}
        merge(json, info)
        merge(json, res)

        const blob = new FileType(json)
        this._blobCache[path] = blob
        return blob
      }

      const blob = new FileType({ path })
      this._blobCache[path] = blob
      return blob
    }.bind(this))
  }

  /**
   * Delete a file.
   */

  deleteFile(path = '') { return co(function*(){
    // empty path, throw error
    if (!path) throw new Error('Path is empty.')

    // if blob is in cache, remove and destroy
    let blob
    if (path in this._blobCache) {
      blob = this._blobCache[path]
      delete this._blobCache[path]
      blob.destroy()
    }

    // get tree, get blob info
    const tree = yield this._treeRes()
    const info = tree.tree.find(info =>
                                info.path === path &&
                                info.type === 'blob')

    // delete was successful, return
    if (blob && !info) return

    // file not found, throw error
    if (!blob && !info) throw new Error('File was not found.')

    // otherwise, we need to recursively re-create subtrees

    // get parent directories to update
    const segments = path.split('/')
    const [, ...parentDirs] = segments
      .map((seg, i) => {
        if (i === 0) return seg
        return segments.slice(0, i).join('/') + '/' + seg
      })
      .reverse()
      .concat('')

    // remove file from tree cache
    removeElement(tree.tree, i => i.path === path)

    for (const dir of parentDirs) {
      // filter out tree from the tree cache
      let t = tree.tree.filter(i => isDirectChild(dir, i.path))

      // convert all paths to basenames
      t = t.map(info => {
        const o = {}
        merge(o, info)
        o.path = basename(o.path)
        return o
      })

      // create new tree on github
      const res = yield this._wrapGithub('createTree', { tree: t })

      // update tree cache with new tree info entry
      if (dir === '') {
        tree.sha = res.sha
        tree.url = res.url
      } else {
        removeElement(tree.tree, i => i.path === dir)
        tree.tree.push({
          path: dir,
          mode: '040000',
          type: 'tree',
          sha: res.sha,
          url: res.url,
        })
      }
    }
  }.bind(this)) }

  commit(message = '') {
  }
}

