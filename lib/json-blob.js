
const Blob = require('./blob')
const stringify = require('json-stable-stringify')

module.exports = class JSONBlob extends Blob {

  /**
   * Retrieve parsed JSON. This will throw an InvalidError if the JSON is
   * invalid.
   */

  get content() {
    return JSON.parse(super.content)
  }

  /**
   * Retrieve the original JSON, parsed. This will throw an InvalidError if the
   * JSON is invalid.
   */

  get originalContent() {
    return JSON.parse(super.originalContent)
  }

  set content(value) {
    super.content = stringify(value, { space: '\t' }) + '\n'
  }
}

