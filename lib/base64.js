
/**
 * Decode a base64-encoded Unicode string.
 */

exports.decode = function decode() {
  // base64 decode
  str = atob(str)

  // percent encode
  str = Array.prototype.map.call(str, function(c) {
    return '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join('')

  // percent decode into original Unicode string
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

