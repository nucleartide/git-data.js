
const token = process.env.TOKEN
const GitHub = require('../lib/github')
const assert = require('assert')
const co = require('co')
const treeFixture = require('./fixtures/tree')
const clone = json => JSON.parse(JSON.stringify(json))

describe('.getTree()', function() {
  it('should only fetch files in the root directory', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const flat = yield github.getTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        sha: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
        recursive: false,
      })

      const recursive = yield github.getTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        sha: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
        recursive: true,
      })

      assert(flat.tree.length < recursive.tree.length)
    })
  })

  it('should return the same thing for any value of `recursive`')
})

describe('.createTree()', function() {
  it('should create a tree', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const res = yield github.createTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        tree: treeFixture,
      })
      assert.equal(res.tree.length, treeFixture.length)

      const actualPaths = res.tree.map(obj => obj.path)
      const expectedPaths = treeFixture.map(obj => obj.path)
      assert.deepEqual(actualPaths, expectedPaths)
    })
  })

  it('should add a blob to the tree using sha', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const res = yield github.createTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        tree: [{
          "path": "Readme_copy.md",
          "mode": "100644",
          "type": "blob",
          "sha": "866c316f5cab6b10ad08b2f2cfda2173f0ab811d",
        }],
        base_tree: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
      })
      assert.equal(res.tree.length, 14 + 1)

      const blob = res.tree.find(obj => obj.path === 'Readme_copy.md')
      assert.equal(blob.sha, '866c316f5cab6b10ad08b2f2cfda2173f0ab811d')
    })
  })

  it('should add a blob to the tree using content', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const res = yield github.createTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        tree: [{
          "path": "something.txt",
          "mode": "100644",
          "type": "blob",
          "content": "asdf asdf asdf asdf",
        }],
        base_tree: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
      })
      assert.equal(res.tree.length, 14 + 1)

      const blob = res.tree.find(obj => obj.path === 'something.txt')
      assert.equal(blob.size, 'asdf asdf asdf asdf'.length)
    })
  })

  it('should edit a blob', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const res = yield github.createTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        tree: [{
          "path": "Readme.md",
          "mode": "100644",
          "type": "blob",
          "content": "olympics are starting!!!",
        }],
        base_tree: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
      })
      assert.equal(res.tree.length, 14)

      const blob = res.tree.find(obj => obj.path === 'Readme.md')
      assert.equal(blob.size, 'olympics are starting!!!'.length)
    })
  })

  it('can recursively update', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const res = yield github.getTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        sha: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
      })

      // update deep path
      const res2 = yield github.createTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        tree: [{
          path: 'tests/test-helper.js',
          mode: '100644',
          type: 'blob',
          content: 'omg wtf bbq',
        }],
        base_tree: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
      })
    })
  })

  it('can recursively delete', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const res =  yield github.getTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        sha: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
        recursive: true,
      })

      const res2 = yield github.createTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        tree: res.tree.slice(0, -1),
        base_tree: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
        recursive: true,
      })
    })
  })
})

