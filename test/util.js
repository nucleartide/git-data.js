
const {
  merge,
  startsWith,
  endsWith,
  isDirectChild,
  basename,
  dirname,
  removeElement,
} = require('../lib/util')
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

describe('.basename(str)', function() {
  it('works', function() {
    assert.equal(basename('a/b/c/d'), 'd')
    assert.equal(basename('a/b/c'), 'c')
    assert.equal(basename('a/b'), 'b')
    assert.equal(basename('a'), 'a')
    assert.equal(basename(''), '')
  })
})

describe('.dirname(str)', function() {
  it('works', function() {
    assert.equal(dirname('a/b/c/d'), 'a/b/c')
    assert.equal(dirname('a/b/c'), 'a/b')
    assert.equal(dirname('a/b'), 'a')
    assert.equal(dirname('a'), '')
    assert.equal(dirname(''), '')
  })
})

describe('.isDirectChild(p1, p2)', function() {
  it('works', function() {
    assert(isDirectChild('test', 'test/shared.js'))
    assert(isDirectChild('a/b/c', 'a/b/c/d.js'))
    assert(isDirectChild('', 'something.js'))
    assert(isDirectChild('', 'test.txt'))
    assert(isDirectChild('', 'test'))
    assert(!isDirectChild('', 'test/something.js'))
  })
})

describe('.removeElement(arr, cb)', function() {
  it('should remove the element from the array', function() {
    const arr = [{a:'hi'},{b:'hi'},{c:'hi'}]
    const cb = o => 'a' in o
    removeElement(arr, cb)
    assert.deepEqual(arr, [{b:'hi'},{c:'hi'}])
  })

  it('should return with the removed element', function() {
    const result = removeElement([1, 2, 3, 4], e => e === 2)
    assert.equal(result, 2)
  })
})

