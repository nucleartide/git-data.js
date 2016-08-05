
const request = require('superagent')
Promise = Promise || require('promise')

/**
 * github - make github requests. stateless.
 * repo   - make file system–like requests. repo props are immutable. stateful.
 *
 * const github = new GitHub({ token: 'asdfasdfasdfasdfasdf' })
 */
module.exports = class GitHub {

  /**
   * Initialize GitHub with an access token.
   *
   * Falsy access tokens will error.
   */

  constructor({ token } = {}) {
    if (!token) throw new Error('must pass in github access token')
    this.token = token
  }

  /**
   * https://developer.github.com/v3/git/blobs/#get-a-blob
   */

  getBlob({ owner, repo, sha } = {}) {
    const token = this.token
    return request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`)
    .set('Authorization', `token ${token}`)
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/commits/#get-a-commit
   */

  getCommit({ owner, repo, sha } = {}) {
    const token = this.token
    return request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/commits/${sha}`)
    .set('Authorization', `token ${token}`)
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/trees/#get-a-tree
   */

  getTree({ owner, repo, sha, recursive = false } = {}) {
    const token = this.token
    let req = request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`)
    .set('Authorization', `token ${token}`)
    if (recursive) req = req.query({ recursive: true })
    req = req.then(res => res.body)
    return req
  }

  /**
   * https://developer.github.com/v3/git/refs/#get-a-reference
   */

  getReference({ owner, repo, ref } = {}) {
    const token = this.token
    return request
    .get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${ref}`)
    .set('Authorization', `token ${token}`)
    .then(res => res.body)
  }

  createTree({ owner, repo } = {}) {
  }

  createBlob() {
  }

  createCommit() {
  }

  updateReference() {
  }
}

