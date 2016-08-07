
const request = require('superagent')
const Repo = require('./repo')

try {
  Promise
} catch (err) {
  if (err instanceof ReferenceError) Promise = require('promise')
}

module.exports = class GitHub {

  /**
   * Initialize GitHub with an access token.
   *
   * Falsy access tokens will error.
   */

  constructor({ token } = {}) {
    if (!token) throw new Error('Must pass in GitHub access token.')
    this.token = token
  }

  /**
   * https://developer.github.com/v3/git/blobs/#get-a-blob
   */

  getBlob({ owner, repo, sha } = {}) {
    return request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`)
    .set('Authorization', `token ${this.token}`)
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/commits/#get-a-commit
   */

  getCommit({ owner, repo, sha } = {}) {
    return request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/commits/${sha}`)
    .set('Authorization', `token ${this.token}`)
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/trees/#get-a-tree
   */

  getTree({ owner, repo, sha, recursive } = {}) {
    let req = request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`)
    .set('Authorization', `token ${this.token}`)
    if (recursive) req = req.query({ recursive: true })
    req = req.then(res => res.body)
    return req
  }

  /**
   * https://developer.github.com/v3/git/refs/#get-a-reference
   */

  getReference({ owner, repo, ref } = {}) {
    return request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${ref}`)
    .set('Authorization', `token ${this.token}`)
    .then(res => {
      const body = res.body
      if (Array.isArray(body)) throw new Error(`Reference ${ref} not found.`)
      return body
    })
  }

  /**
   * https://developer.github.com/v3/git/trees/#create-a-tree
   */

  createTree({ owner, repo, tree, base_tree } = {}) {
    return request
    .post(`https://api.github.com/repos/${owner}/${repo}/git/trees`)
    .set('Authorization', `token ${this.token}`)
    .send({ tree, base_tree })
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/commits/#create-a-commit
   */

  createCommit({ owner, repo, message, tree, parents } = {}) {
    return request
    .post(`https://api.github.com/repos/${owner}/${repo}/git/commits`)
    .set('Authorization', `token ${this.token}`)
    .send({ message, tree, parents })
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/refs/#update-a-reference
   */

  updateReference({ owner, repo, ref, sha, force = false } = {}) {
    return request
    .patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${ref}`)
    .set('Authorization', `token ${this.token}`)
    .send({ sha, force })
    .then(res => res.body)
  }

  /**
   * Repo exposes a high-level file system API to a Git repository.
   */

  repo({ owner, repo, branch, commitPrefix } = {}) {
    return new Repo({ github: this, owner, repo, branch, commitPrefix })
  }
}

