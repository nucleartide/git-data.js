
# git-data.js

High-level wrapper for GitHub's Git Database API.

## Features

- Promise based
- filesystem style API
- usable in browsers and node.js
- commit once for arbitrarily many file changes

## Install

```
$ npm install git-data
```

## Use

```js
// create an object for accessing the Git Data API
const github = new GitHub({
  token: 'a0dfga704a3b045d87e332ebf16fc9210e497ba0'
})

// create an object that provides you with a high-level filesystem API
github.repo({
  owner: 'nucleartide',
  repo: 'git-data.js',
  branch: 'master',
})

// create a file
const readme = await repo.createFile('Readme.md')
const addTest = await repo.createFile('test/unit/add.js')

// read a file
const packageJson = await repo.readFile('package.json')
const utilFile = await repo.readFile('lib/util.js')

// update a file
readme.content = 'this is a readme'

// update a JSON file
readme.content = {
  "dependencies": {
    "git-data": "0.1.0"
  }
}

// delete a file
await repo.deleteFile('package.json')
await repo.deleteFile('test/unit/add.js')
await repo.deleteFile('lib/util.js')

// commit all changes
try {
  await repo.commit('this is a commit message')
} catch (err) {
  // if someone else commits, invalidate our changes
  if (err.status === 409) repo.invalidate()
}
```

## API

- TODO: document commit prefix
- TODO: implement aliases
  - create: `repo.touch('new-file.txt')`
  - read: `repo.open('package.json')`
  - delete: `repo.rm('Readme.md')`
- TODO: implement invalidate

## License

MIT

