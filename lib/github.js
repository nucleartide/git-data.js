
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

  /**
   * https://developer.github.com/v3/git/trees/#create-a-tree
   */

  createTree({ owner, repo, tree = [], base_tree } = {}) {
    const token = this.token
    return request
    .post(`https://api.github.com/repos/${owner}/${repo}/git/trees`)
    .set('Authorization', `token ${token}`)
    .send({ tree, base_tree })
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/blobs/#create-a-blob
   *
   * Note: you should probably use `.createTree()` instead.
   */

  createBlob({ owner, repo, content, encoding = 'utf-8' }) {
    const token = this.token
    return request
    .post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`)
    .set('Authorization', `token ${token}`)
    .send({ content, encoding })
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/commits/#create-a-commit
   */

  createCommit({ owner, repo, message, tree, parents = [] }) {
    const token = this.token
    return request
    .post(`https://api.github.com/repos/${owner}/${repo}/git/commits`)
    .set('Authorization', `token ${token}`)
    .send({ message, tree, parents })
    .then(res => res.body)
  }

  /**
   * https://developer.github.com/v3/git/refs/#update-a-reference
   */

  updateReference({ owner, repo, ref, sha, force = false }) {
    const token = this.token
    const host = 'https://api.github.com'
    return request
    .patch(`${host}/repos/${owner}/${repo}/git/refs/heads/${ref}`)
    .set('Authorization', `token ${token}`)
    .send({ sha, force })
    .then(res => res.body)
  }
}

