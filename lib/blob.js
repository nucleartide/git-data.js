
const { decode, encode } = require('base64')

module.exports = class Blob {

  /**
   * Initialize a representation of a GitHub blob. If
   * content is specified, it should be in base64 form.
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

    this.isDestroyed = false
    this.isDirty = opts.isDirty || false
    this._originalContent = opts.content || ''
  }

  get originalContent() {
    return decode(this._originalContent)
  }

  get content() {
    return decode(this._content)
  }

  /**
   * Retrieve blob contents in base64 form.
   */

  get rawContent() {
    return this._content
  }

  set content(value) {
    if (this.isDestroyed) throw new Error('blob was destroyed')
    this._content = encode(value)
    this.isDirty = true
  }

  destroy() {
    this.isDestroyed = true
  }
}

