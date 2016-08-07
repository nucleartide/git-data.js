
const { decode, encode } = require('../lib/base64')
const assert = require('assert')

describe('.decode(str)', function() {
  it('should work', function() {
    assert.equal(decode('4pyTIMOgIGxhIG1vZGU='), '✓ à la mode')
    assert.equal(decode('Cg=='), '\n')
  })
})

describe('.encode(str)', function() {
  it('should work', function() {
    assert.equal(encode('✓ à la mode'), '4pyTIMOgIGxhIG1vZGU=')
    assert.equal(encode('\n'), 'Cg==')
  })
})

