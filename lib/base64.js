
try { atob } catch (err) { atob = require('atob') }
try { btoa } catch (err) { btoa = require('btoa') }

/**
 * Decode a base64-encoded Unicode string.
 */

exports.decode = function decode(str) {
  // base64 decode
  str = atob(str)

  // percent encode
  str = str
  .split('')
  .map(ch => '%' + ('0' + ch.charCodeAt(0).toString(16)).slice(-2))
  .join('')

  // percent decode into original unicode string
  str = decodeURIComponent(str)

  return str
}

/**
 * Encode a Unicode string using base64.
 */

exports.encode = function encode(str) {
  // percent encode each byte of the string
  str = encodeURIComponent(str)

  // percent decode (aka convert to ascii equivalents)
  str = str.replace(/%([0-9A-Fa-f]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt('0x' + p1, 16))
  })

  // base64 encode
  str = btoa(str)

  return str
}

