
const Blob = require('../lib/blob')
const btoa = require('btoa')
const assert = require('assert')
const shared = require('./shared')

describe('Blob', function() {
  beforeEach(function() {
    this.FileType = Blob
  })

  shared.shouldBehaveLikeABlob()
})

describe('.content', function() {
  it('should decode content', function() {
    const c = btoa('this is a file')
    const b = new Blob({ content: c })

    assert.equal(b.content, 'this is a file')
  })
})

describe('.content = value', function() {
  it('should encode content', function() {
    const b = new Blob
    b.content = 'this is a file'

    assert.equal(b._content, btoa('this is a file'))
  })
})

describe('.originalContent', function() {
  it('should decode original content', function() {
    const c = btoa('this is a file')
    const b = new Blob({ content: c })

    assert.equal(b.originalContent, 'this is a file')
  })
})

