
const JSONBlob = require('../../lib/json-blob')
const shared = require('./shared')
const assert = require('assert')

describe('JSONBlob', function() {
  beforeEach(function() {
    this.FileType = JSONBlob
  })

  shared.shouldBehaveLikeABlob()
})

describe('.content', function() {
  it('should decode content', function() {
    const c = btoa(JSON.stringify({ ahh: 'doggy' }))
    const b = new JSONBlob({ content: c })
    assert.deepEqual(b.content, { ahh: 'doggy' })
  })

  it('should work when decoding an empty string', function() {
    const c = btoa('')
    const b = new JSONBlob({ content: c })
    assert.deepEqual(b.content, '')
  })
})

describe('.content = value', function() {
  it('should encode content', function() {
    const b = new JSONBlob
    b.content = { hi: 'mom' }

    assert.equal(b._content, btoa(JSON.stringify(b.content, null, '\t') + '\n'))
    assert.notDeepEqual(b.content, b.originalContent)
  })
})

describe('.size', function() {
  it('should be computed based on the content length', function() {
    const b = new JSONBlob({ content: btoa('something') })
    assert.equal(b.size, 'something'.length)

    b.content = 'bloop'
    assert.equal(b.size, '"bloop"\n'.length)
  })
})

describe('.originalContent', function() {
  it('should decode originalContent', function() {
    const c = btoa('"this is a file"')
    const b = new JSONBlob({ content: c })

    assert.equal(b.originalContent, 'this is a file')
  })

  it('should be able to set originalContent', function() {
    const c = btoa('"this is a file"')
    const b = new JSONBlob({ content: c })
    b.originalContent = "something"

    assert.equal(b.originalContent, 'something')
  })
})

