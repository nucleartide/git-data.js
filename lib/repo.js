
const Blob = require('./blob')
const JSONBlob = require('./json-blob')
const endsWith = (str, end) => str.slice(-end.length) === end
const startsWith = (haystack, needle) => haystack.indexOf(needle) === 0
const co = require('co')
const merge = (a, b) => { for (const attr in b) { a[attr] = b[attr] } }

module.exports = class Repo {

  /**
   * Initialize a repo with an owner, a repo, and a branch.
   */

  constructor(opts = {}) {
    this._github = opts.github
    this.owner = opts.owner
    this.repo = opts.repo
    this.branch = opts.branch

    this._blobCache = {}
    this._treeCache = null
  }

  static detectFileType(path) {
    if (endsWith(path, '.json')) return JSONBlob
    return Blob
  }

  github(method, opts = {}) {
    const args = {}
    merge(args, { owner: this.owner, repo: this.repo })
    merge(args, opts)
    return this._github[method](args)
  }

  tree() {
    if (this._treeCache) return Promise.resolve(this._treeCache)

    return co(function*(){
      const ref = yield this.github('getReference', { ref: this.branch })
      const commitSHA = ref.object.sha
      const commit = yield this.github('getCommit', { sha: commitSHA })
      const treeSHA = commit.tree.sha

      return yield this.github('getTree', {
        sha: treeSHA,
        recursive: true
      })
    })
  }

  readFile(path = '', FileType = Repo.detectFileType(path)) {
    if (path in this._blobCache) return Promise.resolve(this._blobCache[path])

    return co(function*(){
      const tree = yield this.tree()
      const info = tree.tree.find(info =>
        info.path === path &&
        info.type === 'blob')

      if (!info) throw new Error('file not found')
      const res = yield this.github('getBlob', { sha: info.sha })

      const json = {}
      merge(json, info)
      merge(json, res)

      const blob = new FileType(json)
      this._blobCache[path] = blob
      return blob
    }.bind(this))
  }

  /**
   * Create a file. If the file exists, the existing file
   * will be returned instead.
   */

  createFile(path = '', FileType = Repo.detectFileType(pat)) {
    if (path in this._blobCache) return Promise.resolve(this._blobCache[path])

    return co(function*(){
      const tree = yield this.tree()
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

      const blob = new FileType({ path, isDirty: true })
      this._blobCache[path] = blob
      return blob
    })
  }

  deleteFile() {
    // if path is empty, return
    // if path is not in root tree, return
    // if path is not a file path, return

    // if blob is cached, un-cache and destroy the blob
    // if blob hasn't been created yet, return

    // fetch the file's (referred to by path) tree
    // delete the path from the tree
    // create the new tree on github
  }

  commit() {
  }
}

