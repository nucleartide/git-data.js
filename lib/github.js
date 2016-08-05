
const request = require('superagent')
const co = require('co')
Promise = Promise || require('promise')

/**
 * github - make github requests. stateless.
 * repo   - make file system–like requests. repo props are immutable. stateful.
 *
 * const github = new GitHub({ token: 'asdfasdfasdfasdfasdf' })
 */
module.exports = class GitHub {
  /**
   * @param {String} options.token
   */
  constructor({ token } = {}) {
    if (!token) throw new Error('must pass in github access token')
    this.token = token
    this.host = 'https://api.github.com'
  }

  /**
   * https://developer.github.com/v3/git/blobs/#get-a-blob
   *
   * @param {String} options.owner
   * @param {String} options.repo
   * @param {String} options.sha
   * @return {Promise}
   */
  getBlob({ owner, repo, sha } = {}) {
    if (!owner) throw new Error('must pass in owner')
    if (!repo) throw new Error('must pass in repo')
    if (!sha) throw new Error('must pass in sha')
    const token = this.token

    return co(function*(){
      const req = request
        .get(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`)
        .set('Authorization', `token ${token}`)
      return (yield req).res.body
    })
  }

  /**
   * https://developer.github.com/v3/git/commits/#get-a-commit
   *
   * @param {String} options.owner
   * @param {String} options.repo
   * @param {String} options.sha
   * @return {Promise}
   */
  getCommit({ owner, repo, sha } = {}) {
    if (!owner) throw new Error('must pass in owner')
    if (!repo) throw new Error('must pass in repo')
    if (!sha) throw new Error('must pass in sha')
    const token = this.token

    return co(function*(){
      const req = request
        .get(`https://api.github.com/repos/${owner}/${repo}/git/commits/${sha}`)
        .set('Authorization', `token ${token}`)
      return (yield req).res.body
    })
  }

  /**
   * https://developer.github.com/v3/git/trees/#get-a-tree
   *
   * @param {String} options.owner
   * @param {String} options.repo
   * @param {String} options.sha
   * @param {Boolean} options.recursive
   * @return {Promise}
   */
  getTree({ owner, repo, sha, recursive = false } = {}) {
    if (!owner) throw new Error('must pass in owner')
    if (!repo) throw new Error('must pass in repo')
    if (!sha) throw new Error('must pass in sha')
    const token = this.token

    return co(function*(){
      let req = request
        .get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`)
        .set('Authorization', `token ${token}`)
      if (recursive) req = req.query({ recursive: true })
      return (yield req).res.body
    })
  }

  getReference({ owner, repo, ref } = {}) {
    if (!owner) throw new Error('must pass in owner')
    if (!repo) throw new Error('must pass in repo')
    if (!ref) throw new Error('must pass in ref')
    if (ref.slice(0, 'heads/'.length) === 'heads/') {
      throw new Error('you can omit "heads/"')
    }
    const token = this.token
    const host = this.token

    return co(function*(){
      const req = request
        .get(`${host}/repos/${owner}/${repo}/git/refs/heads/${ref}`)
        .set('Authorization', `token ${token}`)
      return (yield req).res.body
    })
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

