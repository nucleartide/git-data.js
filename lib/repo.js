
const Blob = require('./Blob')
const JSONBlob = require('./JSONBlob')
const endsWith = (str, end) => str.slice(-end.length) === end

module.exports = class Repo {

  /**
   * Initialize a repo with an owner, a repo, and a branch.
   */

  constructor({ github, owner, repo, branch } = {}) {
    this.github = github
    this.owner = owner
    this.repo = repo
    this.branch = branch
  }

  static detectFileType(path) {
    if (endsWith(path, '.json')) return JSONBlob
    return Blob
  }
}

