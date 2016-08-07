
const Blob = require('../lib/blob')
const JSONBlob = require('../lib/json-blob')
const Repo = require('../lib/repo')
const assert = require('assert')
const co = require('co')
const GitHub = require('../lib/github')

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

describe('.deleteFile(path)', function() {
  it('should work', function() {
    const g = new GitHub({ token })
    const r = g.repo({
      owner: 'nucleartide',
      repo: 'git-data.js',
      branch: 'master',
    })

    return co(function*(){
      yield r.deleteFile('test/shared.js')
    })
  })
})

