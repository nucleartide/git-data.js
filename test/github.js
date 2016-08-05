
const token = process.env.TOKEN
const GitHub = require('../lib/github')
const assert = require('assert')
const co = require('co')

describe('.getTree({ recursive })', function() {
  it('should only fetch files in the root directory', function() {
    const github = new GitHub({ token })

    return co(function*(){
      const flatTree = yield github.getTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        sha: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
        recursive: false,
      })

      const recursiveTree = yield github.getTree({
        owner: 'nucleartide',
        repo: 'ember-outside-click',
        sha: 'a2bf79ad37b33a29da3f0cb4bac0567ec7e6d431',
        recursive: true,
      })

      assert(flatTree.tree.length < recursiveTree.tree.length)
    })
  })
})

