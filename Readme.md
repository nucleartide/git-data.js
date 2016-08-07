
# git-data.js

## Usage

```js
// make github api calls with this:
const github = new GitHub({
  token: 'a0dfga704a3b045d87e332ebf16fc9210e497ba0'
})

// example api calls:
await github.getBlob(...)
await github.getTree(...)

// make high-level, file system calls with this:
github.repo({
  owner: 'nucleartide',
  repo: 'ember-outside-click',
  branch: 'master',
  commitPrefix: '[automated]', // optional
})

// create a file
const readme = await repo.createFile('Readme.md')
const readme = await repo.touch('Readme.md')

// read a file
const packageJson = await repo.readFile('package.json')

// update a file
readme.content = 'this is a readme'

// update a JSON file
packageJson.content = {
  "dependencies": {
    "git-data.js": "0.1.0"
  }
}

// delete a file
await repo.deleteFile('package.json')
await repo.rm('package.json') // alias

// commit
try {
  const commitSHA = await repo.commit('this is a commit message')
  console.log(commitSHA)
} catch (err) {
  console.log('someone else committed, must invalidate repo cache')
  repo.invalidate()
}

// blobs
readme.content
readme.originalContent

// error objects
try {
  // ..
} catch (err) {
  if (err instanceof AjaxError) {
  }

  if (err instanceof RateLimitError) {
  }

  if (err instanceof ConflictError) {
  }
}
```

## License

MIT

