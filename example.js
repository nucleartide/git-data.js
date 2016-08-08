
const GitHub = require('.')
const co = require('co')

const token = process.env.TOKEN
if (!token) throw new Error(`
  Must set TOKEN to GitHub access token.
  Generate a token by visiting https://github.com/settings/tokens
`)

// create an object for accessing the Git Data API
const g = new GitHub({ token })

// create an object that provides you with a high-level filesystem API
const repo = g.repo({
  owner: 'nucleartide',
  repo: 'git-data-test',
  branch: 'master',
  commitPrefix: '[automated]' // optional, prepended to your commit message
})

co(function*(){
  // create some files
  const readme = yield repo.createFile('Readme.md')
  const anotherReadme = yield repo.createFile('a/b/c/Readme.md')
  const packageJson = yield repo.createFile('package.json')

  // read a file
  const index = yield repo.readFile('index.js')
  const something = yield repo.readFile('test/something/something.txt')
  const test = yield repo.readFile('test/something/test.txt')

  // update a file
  readme.content = String(Date.now())

  // update a JSON file
  packageJson.content = {
    "dependencies": {
      "git-data": "0.1.0"
    }
  }

  // delete a file
  yield repo.deleteFile('a/b/c/Readme.md')

  // commit all changes
  try {
    yield repo.commit('this is a message with a commit prefix')
  } catch (err) {
    // if someone else commits, invalidate our changes
    if (err.status === 409) repo.invalidate()
    throw err
  }
}).catch(err => console.error(err.stack))

