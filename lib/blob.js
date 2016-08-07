
const { decode, encode } = require('./base64')

module.exports = class Blob {

  /**
   * Initialize a representation of a GitHub blob. If content is specified, it
   * should be in base64 form.
   */

  constructor(opts = {}) {
    // returned by https://developer.github.com/v3/git/blobs/#get-a-blob
    this._content = opts.content || ''
    this.encoding = 'base64'
    this.url = opts.url || ''
    this.sha = opts.sha || ''
    this.size = opts.size || 0

    // returned by https://developer.github.com/v3/git/trees/#get-a-tree
    this.path = opts.path || ''
    this.mode = opts.mode || ''

    this._originalContent = opts.content || ''
    this.isDestroyed = false
  }

  get content() {
    return decode(this._content)
  }

  set content(value) {
    if (this.isDestroyed) throw new Error('Cannot modify, blob was destroyed.')
    this._content = encode(value)
  }

  get originalContent() {
    return decode(this._originalContent)
  }

  destroy() {
    this.isDestroyed = true
  }

  /**
   * TODO: i might not need this, since i can use createTree nested paths
   */

  get isDirty() {
    return this._content !== this._originalContent
  }
}

