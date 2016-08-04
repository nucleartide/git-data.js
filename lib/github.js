
const request = require('superagent')

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
  constructor({ token }) {
    if (!token) throw new Error('must pass in github access token')
    this.token = token
    this.request = request // TODO: pre-configure with token?
  }

  get host() {
    return 'https://api.github.com'
  }

  get headers() {
    return { Authorization: `token ${token}` }
  }

  // TODO: request git ref
  // TODO: request commit
  // TODO: request tree
  // TODO: request blob
  // TODO: async in node.js?

  async getBlob() {
  }

  async getCommit() {
  }

  async getTree() {
  }

  async getReference() {
  }
}

