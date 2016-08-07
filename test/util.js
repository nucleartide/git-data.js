
const { merge, startsWith, endsWith, isDirectChild } = require('../lib/util')
const assert = require('assert')

describe('.merge(a, b)', function() {
  it('works', function() {
    const a = { hi: 'jason' }
    const b = { hi: 'jesse', orange: 'mango' }
    merge(a, b)
    assert.deepEqual(a, { hi: 'jesse', orange: 'mango' })
  })
})

describe('.startsWith(str, start)', function() {
  it('works', function() {
    assert(startsWith('alaska', 'alas'))
    assert(startsWith('red mango', 'red '))
    assert(startsWith('', ''))
    assert(startsWith('derp        whoop', 'derp '))
  })
})

describe('.endsWith(str, end)', function() {
  it('works', function() {
    assert(endsWith('something.json', '.json'))
    assert(endsWith('something.txt', '.txt'))
    assert(endsWith('testdir/nesteddir/something.txt', 'nesteddir/something.txt'))
  })
})

describe('.isDirectChild(p1, p2)', function() {
  it('works', function() {
    assert(isDirectChild('test', 'test/shared.js'))
    assert(isDirectChild('a/b/c', 'a/b/c/d.js'))
    assert(isDirectChild('', 'something.js'))
    assert(isDirectChild('', 'test.txt'))
    assert(isDirectChild('', 'test'))
  })
})

