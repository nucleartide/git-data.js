
const Blob = require('../../lib/blob')
const JSONBlob = require('../../lib/json-blob')
const Repo = require('../../lib/repo')
const assert = require('assert')
const co = require('co')
const GitHub = require('../../lib/github')
const clone = json => JSON.parse(JSON.stringify(json))

const token = process.env.TOKEN
if (!token) throw new Error('Must set TOKEN environment variable.')

describe('.detectFileType(path)', function() {
  it('should return JSONBlob for json files', function() {
    assert.equal(JSONBlob, Repo.detectFileType('test.json'))
    assert.equal(JSONBlob, Repo.detectFileType('testdir/test.json'))
    assert.equal(JSONBlob, Repo.detectFileType('testdir/nesteddir/test.json'))
  })

  it('should return Blob for non-json files', function() {
    assert.equal(Blob, Repo.detectFileType('test.txt'))
    assert.equal(Blob, Repo.detectFileType('testdir/test.md'))
    assert.equal(Blob, Repo.detectFileType('testdir/nesteddir/test.js'))
  })
})

describe('._treeRes()', function() {
  it('should return the cache if it exists', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })
    r._treeCache = 'something'

    return co(function*(){
      const tree = yield r._treeRes()
      assert.equal(tree, 'something')
    })
  })

  it("should fetch the cache if it doesn't exist", function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const tree = yield r._treeRes()
      assert('sha' in tree)
      assert('url' in tree)
      assert('tree' in tree)
      assert('truncated' in tree)
    })
  })

  it('should set last head commit', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      assert(!r._lastHeadCommit)
      yield r._treeRes()
      assert(r._lastHeadCommit)
    })
  })
})

describe('.deleteFile(path)', function() {
  it('should throw an error if the path is empty', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      try {
        yield r.deleteFile('')
        throw new Error('Empty path should have thrown error.')
      } catch (err) {
        assert.equal(err.message, 'Path is empty.')
      }
    })
  })

  it('should remove the file from cache and destroy', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    const b = new Blob
    r._blobCache['testCase'] = b
    assert.equal(Object.keys(r._blobCache).length, 1)

    return co(function*(){
      yield r.deleteFile('testCase')
      assert.equal(Object.keys(r._blobCache).length, 0)
      assert(b.isDestroyed)
    })
  })

  it('should throw an error if the file was not found', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      try {
        yield r.deleteFile('not a file lollololol')
        throw new Error('Should have thrown error')
      } catch (err) {
        assert.equal(err.message, 'File was not found.')
      }
    })
  })

  it('should throw an error if file is a directory', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      try {
        yield r.deleteFile('test')
        throw new Error('Should have thrown error')
      } catch (err) {
        assert.equal(err.message, 'File was not found.')
      }
    })
  })

  it('should remove a file in root dir from the tree cache', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const initialCache = clone(yield r._treeRes())
      yield r.deleteFile('index.js')
      const updatedCache = yield r._treeRes()

      const fileToDelete = updatedCache.tree.find(i => i.path === 'index.js')
      assert(!fileToDelete, 'file was deleted')

      assert.notEqual(updatedCache.sha, initialCache.sha, 'sha was updated')
      assert.notEqual(updatedCache.url, initialCache.url, 'url was updated')
    })
  })

  it('should remove a file in a nested dir from the tree cache', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const initialCache = clone(yield r._treeRes())
      yield r.deleteFile('test/integration/github.js')
      const updatedCache = yield r._treeRes()

      const file = updatedCache.tree.find(i => i.path === 'test/github.js')
      assert(!file, 'file was deleted')

      assert.notEqual(updatedCache.sha, initialCache.sha,
                      'root sha was updated')
      assert.notEqual(updatedCache.url, initialCache.url,
                      'root url was updated')

      const testTree1 = initialCache.tree.find(i => i.path === 'test')
      const testTree2 = updatedCache.tree.find(i => i.path === 'test')
      assert.notEqual(testTree1.sha, testTree2.sha, 'test tree sha was updated')
      assert.notEqual(testTree1.url, testTree2.url, 'test tree url was updated')
    })
  })

  it('should work for empty directories', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const initialCache = clone(yield r._treeRes())
      yield r.deleteFile('test/fixtures/tree.js')
      const updatedCache = yield r._treeRes()

      const f = updatedCache.tree.find(i => i.path === 'test/fixtures/tree.js')
      assert(!f, 'file was deleted')

      assert.notEqual(updatedCache.sha, initialCache.sha, 'sha was updated')
      assert.notEqual(updatedCache.url, initialCache.url, 'url was updated')
    })
  })
})

describe('.readFile(path)', function() {
  it('should return cached blob if blob is in cache', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    const o = {}
    r._blobCache['something'] = o

    return co(function*(){
      const blob = yield r.readFile('something')
      assert.equal(blob, o)
    })
  })

  it('should throw an error if file was not found', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const path = "lolololololo this isn't a file"
      try {
        yield r.readFile(path)
        throw new Error('Should have thrown an Error.')
      } catch (err) {
        assert.equal(err.message, `File "${path}" was not found.`)
      }
    })
  })

  it('should properly set blob fields', function() {
    this.timeout(10 * 1000)

    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.readFile('package.json')
      assert(blob.encoding, 'base64')
      assert(blob.url)
      assert(blob.sha)
      assert(blob.size)
      assert(blob.path)
      assert(blob.mode)
    })
  })

  it('should set the blob on the blob cache', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.readFile('package.json')
      assert(blob.path in r._blobCache)
    })
  })
})

describe('.readFile(path, FileType)', function() {
  it('should instantiate a blob when fetching a non-json file', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.readFile('index.js')
      assert(blob instanceof Blob)
    })
  })

  it('should instantiate a json blob when fetching a json file', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.readFile('package.json')
      assert(blob instanceof JSONBlob)
    })
  })

  it('should instantiate the passed-in class', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    class TestFileType {
      constructor(opts) {
        this.opts = opts
      }
    }

    return co(function*(){
      const blob = yield r.readFile('package.json', TestFileType)
      assert(blob instanceof TestFileType)
    })
  })
})

describe('.createFile(path)', function() {
  it('should return cached blob if blob is in the cache', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    const o = {}
    r._blobCache['something'] = o

    return co(function*(){
      const blob = yield r.createFile('something')
      assert.equal(blob, o)
    })
  })

  it('should properly set blob fields when the file exists', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.createFile('package.json')
      assert(blob.encoding, 'base64')
      assert(blob.url)
      assert(blob.sha)
      assert(blob.size)
      assert(blob.path)
      assert(blob.mode)
    })
  })

  it('should only set path if the file does not exist', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.createFile('bloop.txt')
      assert(blob.encoding, 'base64')
      assert(!blob.url)
      assert(!blob.sha)
      assert(!blob.size)
      assert.equal(blob.path, 'bloop.txt')
      assert(!blob.mode)
    })
  })

  it('should set the blob on cache if the file does not exist', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.createFile('package.json')
      assert(blob.path in r._blobCache)
    })
  })

  it('should set the blob on cache if the file does exist', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.createFile('bloop.txt.does.not.exist')
      assert(blob.path in r._blobCache)
    })
  })
})

describe('.createFile(path, FileType)', function() {
  it('should instantiate a blob when creating a non-json file', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.createFile('index.js')
      assert(blob instanceof Blob)
    })
  })

  it('should instantiate a json blob when creating a json file', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      const blob = yield r.createFile('package.json')
      assert(blob instanceof JSONBlob)
    })
  })

  it('should instantiate the passed-in class', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    class TestFileType {}

    return co(function*(){
      const blob = yield r.createFile('package.json', TestFileType)
      assert(blob instanceof TestFileType)
    })
  })
})

describe('.commit(message)', function() {
  it('should return the git ref response', function() {
    this.timeout(5 * 1000)

    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data-test',
      branch: 'master',
    })

    return co(function*(){
      const testFile = yield r.createFile('test/something/test.txt')
      testFile.content = String(Date.now())

      const anotherOne = yield r.createFile('test/something/something.txt')
      anotherOne.content = String(Date.now())

      const ref = yield r.commit('test message')
      assert('ref' in ref)
      assert('url' in ref)
      assert('object' in ref)
    })
  })

  it('should prefix messages with commit prefixes', function() {
    this.timeout(10 * 1000)

    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data-test',
      branch: 'master',
      commitPrefix: "[i'm hungry]",
    })

    return co(function*(){
      const testFile = yield r.createFile('test/something/test.txt')
      testFile.content = String(Date.now())

      const anotherOne = yield r.createFile('test/something/something.txt')
      anotherOne.content = String(Date.now())

      const ref = yield r.commit('test message')
      const commitRes = yield g.getCommit({
        owner: 'nucleartide',
        repo: 'git-data-test',
        sha: ref.object.sha,
      })
      assert.equal(commitRes.message, "[i'm hungry] test message")
    })
  })

  it('should return 422 if no files were changed', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data-test',
      branch: 'master',
    })

    return co(function*(){
      try {
        yield r.commit('test message')
        throw new Error('Should have thrown Error.')
      } catch (err) {
        assert.equal(err.status, 422)
      }
    })
  })

  it('should empty tree cache and update last head commit', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data-test',
      branch: 'master',
    })

    return co(function*(){
      const testFile = yield r.createFile('test/something/test.txt')
      testFile.content = String(Date.now())

      const anotherOne = yield r.createFile('test/something/something.txt')
      anotherOne.content = String(Date.now())

      const ref = yield r.commit('test message')
      assert.equal(r._treeCache, null)
      assert.equal(r._lastHeadCommit, ref.object.sha)
    })
  })
})

describe('.invalidate()', function() {
  it('should clear the blob cache', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data-test',
      branch: 'master',
    })

    const a = new Blob
    const b = new Blob
    const c = new Blob
    r._blobCache = { a, b, c }
    r.invalidate()

    assert.equal(a.isDestroyed, true)
    assert.equal(b.isDestroyed, true)
    assert.equal(c.isDestroyed, true)
    assert.equal(Object.keys(r._blobCache).length, 0)
  })

  it('should clear tree cache and last head commit', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data-test',
      branch: 'master',
    })

    return co(function*(){
      yield r._treeRes()
      assert.notEqual(r._treeCache, null)
      assert.notEqual(r._lastHeadCommit, '')
      r.invalidate()
      assert.equal(r._treeCache, null)
      assert.equal(r._lastHeadCommit, '')
    })
  })
})

