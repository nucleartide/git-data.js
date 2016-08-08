
const Blob = require('../lib/blob')
const JSONBlob = require('../lib/json-blob')
const Repo = require('../lib/repo')
const assert = require('assert')
const co = require('co')
const GitHub = require('../lib/github')
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
      yield r.deleteFile('test/github.js')
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
})

