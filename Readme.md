
# git-data.js

## Usage

```js
x done
// make github api calls with this:
const github = new GitHub({
  token: 'a0dfga704a3b045d87e332ebf16fc9210e497ba0'
})

x done
// example api calls:
await github.getBlob(...)
await github.getTree(...)

x done
await github.getBlob({
  owner: 'nucleartide',
  repo: 'slots-data-dev',
  sha: 'aliwuheaiwuehlawiuhefiluwhelh',
})

x done
// make high-level, file system calls with this:
github.repo({
  owner: 'nucleartide',
  repo: 'ember-outside-click',
  branch: 'master',
  commitPrefix: '[automated] ', // optional
})

x done
// blobs
readme.content
readme.originalContent

x done
// create a file
const readme = await repo.createFile('Readme.md')
const readme = await repo.touch('Readme.md')

x done
// read a file
const packageJson = await repo.readFile('package.json')

x done
// update a file
readme.content = 'this is a readme'

x done
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
let newRepo
try {
  newRepo = await repo.commit('this is a commit message')
} catch (err) {
  console.log('someone else committed, must construct new repo object')
  newRepo = github.repo({
    owner,
    repo,
    sha,
  })
}

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

// aliases
```

## License

MIT

