
const btoa = require('btoa')
const assert = require('assert')

exports.shouldBehaveLikeABlob = function shouldBehaveLikeABlob() {
  describe('.constructor({ content })', function() {
    it('should set content and original content', function() {
      const c = btoa('this is a file')
      const b = new this.FileType({ content: c })

      assert.equal(b._content, c)
      assert.equal(b._originalContent, c)
    })

    it('should init other blob properties', function() {
      const b = new this.FileType({
        encoding: 'asdf',
        url: 'asdf',
        sha: 'asdf',
        path: 'asdf',
        mode: 'asdf',
      })

      assert.equal(b.encoding, 'base64')
      assert.equal(b.url, 'asdf')
      assert.equal(b.sha, 'asdf')
      assert.equal(b.path, 'asdf')
      assert.equal(b.mode, 'asdf')
    })
  })

  describe('.destroy()', function() {
    it('should set isDestroyed flag to true', function() {
      const b = new this.FileType
      assert.equal(b.isDestroyed, false)

      b.destroy()
      assert.equal(b.isDestroyed, true)
    })
  })
}

