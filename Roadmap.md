
```js
// read files
const javascripts = await repo.readFiles('*.js')

// delete a directory
await repo.deleteDirectory('test')
await repo.rimraf('test')

// customize indentation
await repo.readFile('package.json', JSONBlob(2))
await repo.readFile('package.json', JSONBlob(4))
await repo.readFile('package.json', JSONBlob('\t'))
```

