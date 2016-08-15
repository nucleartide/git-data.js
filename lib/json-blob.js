
const Blob = require('./blob')
const stringify = require('json-stable-stringify')

module.exports = class JSONBlob extends Blob {

  /**
   * Retrieve parsed JSON. This will throw an InvalidError if the JSON is
   * invalid.
   */

  get content() {
    const c = super.content
    return c ? JSON.parse(super.content) : ''
  }

  set content(value) {
    super.content = JSON.stringify(value, null, '\t') + '\n'
  }
}

