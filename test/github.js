
const GitHub = require('../lib/github')
const assert = require('assert')
const co = require('co')
const isObject = require('lodash.isobject')
const request = require('superagent')
const treeFixture = require('./fixtures/tree')
const atob = require('atob')

const token = process.env.TOKEN
if (!token) throw new Error('Must set TOKEN environment variable.')

describe('GitHub()', function() {
  it('should throw an error', function() {
    assert.throws(() => new GitHub, /Must pass in GitHub access token./)
  })
})

describe('GitHub({ token })', function() {
  it('should set access token to token', function() {
    const t = 'asdf'
    const g = new GitHub({ token: t })
    assert.equal(g.token, t)
  })
})

describe('.getBlob({ owner, repo, sha })', function() {
  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.getBlob({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: 'a17994f2fa8e20f15378ddd04b54232a70807f3d',
      })

      assert(isObject(res))
      assert('sha' in res)
      assert('size' in res)
      assert('url' in res)
      assert('content' in res)
      assert('encoding' in res)
    })
  })
})

describe('.getCommit({ owner, repo, sha })', function() {
  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.getCommit({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: '9a9dc4218ccea5f9fc1a81789f57f9b177634ffa',
      })

      assert(isObject(res))
      assert('sha' in res)
      assert('url' in res)
      assert('author' in res)
      assert('committer' in res)
      assert('message' in res)
      assert('tree' in res)
      assert('parents' in res)
    })
  })
})

describe('.getTree({ owner, repo, sha })', function() {
  it.skip('should throw an error when the tree has lots of files', function() {
    this.timeout(60 * 1000)
    const g = new GitHub({ token })

    return co(function*(){
      try {
        yield g.getTree({
          owner: 'nucleartide',
          repo: 'git-data-test',
          sha: 'd6bd61137e22a0327b8d96da31752d43257e582a',
        })
      } catch (err) {
        assert(err.status >= 500)
        assert('message' in err.response.body)
      }
    })
  })

  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.getTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })

      assert(isObject(res))
      assert('sha' in res)
      assert('url' in res)
      assert('tree' in res)
      assert(!res.truncated, 'truncated is always false')
    })
  })
})

describe('get a tree recursively', function() {
  it('should return the same thing for any value of recursive', function() {
    return co(function*(){
      const req1 = yield request
      .get(`https://api.github.com/repos/nucleartide/git-data.js/git/trees/8b31f214e2691e7c078653fe02fc6f124695d604`)
      .set('Authorization', `token ${token}`)
      .query({ recursive: 1 })
      .then(res => res.body)

      const req2 = yield request
      .get(`https://api.github.com/repos/nucleartide/git-data.js/git/trees/8b31f214e2691e7c078653fe02fc6f124695d604`)
      .set('Authorization', `token ${token}`)
      .query({ recursive: 2 })
      .then(res => res.body)

      const req3 = yield request
      .get(`https://api.github.com/repos/nucleartide/git-data.js/git/trees/8b31f214e2691e7c078653fe02fc6f124695d604`)
      .set('Authorization', `token ${token}`)
      .query({ recursive: 3 })
      .then(res => res.body)

      const req4 = yield request
      .get(`https://api.github.com/repos/nucleartide/git-data.js/git/trees/8b31f214e2691e7c078653fe02fc6f124695d604`)
      .set('Authorization', `token ${token}`)
      .query({ recursive: true })
      .then(res => res.body)

      assert.equal(req1.tree.length, req2.tree.length)
      assert.equal(req1.tree.length, req3.tree.length)
      assert.equal(req1.tree.length, req4.tree.length)
    })
  })
})

describe('.getTree({ owner, repo, sha, recursive })', function() {
  it('should only fetch files in the root directory', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const flat = yield g.getTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: '8b31f214e2691e7c078653fe02fc6f124695d604',
        recursive: false,
      })

      const recursive = yield g.getTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: '8b31f214e2691e7c078653fe02fc6f124695d604',
        recursive: true,
      })

      assert(flat.tree.length < recursive.tree.length)
    })
  })
})

describe('.getReference({ owner, repo, ref })', function() {
  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.getReference({
        owner: 'nucleartide',
        repo: 'git-data.js',
        ref: 'master',
      })

      assert(isObject(res))
      assert('ref' in res)
      assert('url' in res)
      assert('object' in res)
    })
  })

  it('should throw an error on partial matches', function() {
    const g = new GitHub({ token })

    return co(function*(){
      try {
        yield g.getReference({
          owner: 'nucleartide',
          repo: 'git-data.js',
          ref: 'mast',
        })
      } catch (err) {
        assert.equal(err.message, 'Reference mast not found.')
      }
    })
  })
})

describe('.createTree({ owner, repo, tree })', function() {
  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: treeFixture,
      })
      assert.equal(res.tree.length, treeFixture.length)

      const a = res.tree.map(obj => obj.path)
      const e = treeFixture.map(obj => obj.path)
      assert.deepEqual(a, e)
    })
  })
})

describe('.createTree({ owner, repo, tree, base_tree })', function() {
  it('should add a blob to the tree using sha', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          "path": "Readme_copy.md",
          "mode": "100644",
          "type": "blob",
          "sha": "a17994f2fa8e20f15378ddd04b54232a70807f3d",
        }],
        base_tree: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })
      assert.equal(res.tree.length, 8 + 1)

      const blob = res.tree.find(obj => obj.path === 'Readme_copy.md')
      assert.equal(blob.sha, 'a17994f2fa8e20f15378ddd04b54232a70807f3d')
    })
  })

  it('should add a blob to the tree using content', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          "path": "something.txt",
          "mode": "100644",
          "type": "blob",
          "content": "asdf asdf asdf asdf",
        }],
        base_tree: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })
      assert.equal(res.tree.length, 8 + 1)

      const blob = res.tree.find(obj => obj.path === 'something.txt')
      assert.equal(blob.size, 'asdf asdf asdf asdf'.length)
    })
  })

  it('should edit a blob using content', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          "path": "Readme.md",
          "mode": "100644",
          "type": "blob",
          "content": "derp this is a readme",
        }],
        base_tree: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })
      assert.equal(res.tree.length, 8)

      const blob = res.tree.find(obj => obj.path === 'Readme.md')
      assert.equal(blob.size, 'derp this is a readme'.length)
    })
  })

  it('should edit a tree', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res1 = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          "path": "Readme.md",
          "mode": "100644",
          "type": "blob",
          "content": "derp this is a readme",
        }],
      })

      const res2 = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          "path": "lib",
          "mode": "040000",
          "type": "tree",
          "sha": res1.sha,
        }],
        base_tree: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })

      const lib = res2.tree.find(obj => obj.path === 'lib')
      assert.notEqual(lib.sha, res1.sha)
    })
  })

  it('should edit a blob with a nested path', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res1 = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          path: 'test/test-helper.js',
          mode: '100644',
          type: 'blob',
          content: 'test file',
        }],
        base_tree: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })

      const res2 = yield g.getTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: res1.sha,
        recursive: true,
      })

      const sha = res2.tree.find(obj => obj.path === 'test/test-helper.js').sha

      const res3 = yield g.getBlob({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha,
      })

      assert.equal(atob(res3.content), 'test file')
    })
  })

  it('should edit a tree with a nested path', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res1 = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          path: 'test.txt',
          mode: '100644',
          type: 'blob',
          content: 'test file',
        }],
      })

      const res2 = yield g.createTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        tree: [{
          path: 'test',
          mode: '040000',
          type: 'tree',
          sha: res1.sha,
        }],
        base_tree: '8b31f214e2691e7c078653fe02fc6f124695d604',
      })

      const testDir = res2.tree.find(obj => obj.path === 'test')

      const res3 = yield g.getTree({
        owner: 'nucleartide',
        repo: 'git-data.js',
        sha: testDir.sha,
      })

      const testFile = res3.tree.find(obj => obj.path === 'test.txt')
      assert(testFile)
    })
  })
})

describe('.createCommit({ owner, repo, message, tree, parents })', function() {
  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      const res = yield g.createCommit({
        owner: 'nucleartide',
        repo: 'git-data.js',
        message: 'fml this api sucks',
        tree: 'b7d8ca188c6844a27eced20752ef7fd62a5bc874',
        parents: ['4148c322adc3f8b0dc93658a80d5c7d995bf00ee']
      })

      assert(isObject(res))
      assert('sha' in res)
      assert('url' in res)
      assert('author' in res)
      assert('committer' in res)
      assert('message' in res)
      assert('tree' in res)
      assert('parents' in res)
    })
  })
})

describe('.updateReference({ owner, repo, ref, sha })', function() {
  it('should work', function() {
    const g = new GitHub({ token })

    return co(function*(){
      try {
        yield g.updateReference({
          owner: 'nucleartide',
          repo: 'git-data.js',
          ref: 'master',
          sha: '548853c5736aeecbcdddb85bb4312c304556d0fa',
        })
      } catch (err) {
        assert.equal(err.status, 422)
      }
    })
  })
})

