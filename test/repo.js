
const GitHub = require('../lib/github')

describe('test', function() {
  it('should do something', function() {
    const g = new GitHub({ token: 'asdfasdf' })
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(g)))
    const actual = {}
  })
})

