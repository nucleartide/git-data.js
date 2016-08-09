
# git-data.js

High-level wrapper for GitHub's [Git Database API][1].

## Features

- Promise based
- usable in browsers
- filesystem style API
- no [one-file-change-per-commit][6] limitation
- commit once for arbitrarily many file changes
- build GitHub-backed apps like [Cloud9][8] and [GitBook][7]

## Install

```
$ npm install git-data
```

## API

git-data.js exposes a GitHub object that wraps the Git Data API, as well as a
Repo object that provides the high-level filesystem API. To use the library,
you will need a GitHub access token. For testing purposes, you can generate a
personal access token [here][2].

```js
const GitHub = require('git-data')

const g = new GitHub({
  token: 'your access token here'
})

const repo = g.repo({
  owner: 'nucleartide', // required
  repo: 'git-data.js',  // required
  branch: 'master',     // required
  commitPrefix: '[fix]' // optional, prepended to every commit message
})
```

---

#### `repo.createFile(path, FileType)`

Create a file. If the file exists, the existing file will be returned instead.

###### Params

Param | Type | Description
--- | --- | ---
`path` | String |
`FileType` | Class | Optional. Pass in a class that extends [Blob][3] to override [file type detection][5]. See [JSONBlob][4] for an example.

###### Example

```js
const readme = await repo.createFile('Readme.md')
const packageJson = await repo.createFile('package.json')
const yamlFile = await repo.createFile('test.yaml', YAMLBlob)
```

---

#### `repo.readFile(path, FileType)`

Read a file. If the file doesn't exist, an error will be thrown.

###### Params

Param | Type | Description
--- | --- | ---
`path` | String |
`FileType` | Class | Optional. Pass in a class that extends [Blob][3] to override [file type detection][5]. See [JSONBlob][4] for an example.

###### Example

```js
const testFile = await repo.readFile('a/b/c/test.txt')
const config = await repo.readFile('.eslintrc', JSONBlob)
```

---

#### Update files

This depends on the blob type. For the built-in Blob types, you may only set
strings on [Blobs][3], and you can set any JSON on [JSONBlobs][4].

```js
readme.content = 'this is a readme'

packageJson.content = {
  "dependencies": {
    "git-data": "0.1.0"
  }
}
```

---

#### `repo.deleteFile(path)`

Delete a file. Deleted files may not be updated. If the file doesn't exist, an error will be thrown.

Note that you may only delete files (Git blobs), not directories.

###### Params

Param | Type | Description
--- | --- | ---
`path` | String |

###### Example

```js
await repo.deleteFile('a/b/c/test.txt')
await repo.deleteFile('.eslintrc')
```

---

#### `repo.commit(message)`

Commit all repo changes. If the repo was updated since you first started making
file changes, GitHub will return a 409 conflict error.

###### Params

Param | Type | Description
--- | --- | ---
`message` | String | commit message

###### Example

```js
try {
  await repo.commit('this is a commit message')
} catch (err) {
  if (err.status === 409) repo.invalidate()
  console.error(err.stack)
}
```

---

#### `repo.invalidate()`

Invalidate all file changes and clear the repo's cached tree and commit SHA.
Use this in the case of commit conflicts.

Note that all Blobs returned by the repo may no longer be updated.

```js
repo.invalidate()
```

## License

MIT

[1]: https://developer.github.com/v3/git/
[2]: https://github.com/settings/tokens/
[3]: https://github.com/nucleartide/git-data.js/blob/master/lib/blob.js
[4]: https://github.com/nucleartide/git-data.js/blob/master/lib/json-blob.js
[5]: https://github.com/nucleartide/git-data.js/blob/master/lib/repo.js#L34
[6]: https://developer.github.com/v3/repos/contents/
[7]: https://www.gitbook.com
[8]: https://c9.io/

