
module.exports = class GitHub {
  /**
   * @public
   * @param {String} token
   */
  constructor(token) {
    if (!token) throw new Error('must pass in github access token')
    this.token = token
  }

  get host() {
    return 'https://api.github.com'
  }

  get headers() {
    return { Authorization: `token ${token}` }
  }
}

