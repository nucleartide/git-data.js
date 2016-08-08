
exports.merge = function merge(a, b) {
  for (const attr in b) {
    a[attr] = b[attr]
  }
}

exports.startsWith = function startsWith(str, start) {
  return str.indexOf(start) === 0
}

exports.endsWith = function endsWith(str, end) {
  return str.slice(-end.length) === end
}

exports.basename = function basename(str) {
  return str.split('/').pop()
}

exports.dirname = function dirname(str) {
  return str.split('/').slice(0, -1).join('/')
}

/**
 * Check if `path2` is a direct descendant of `path1`.
 */

exports.isDirectChild = function isDirectChild(path1, path2) {
  const parts1 = path1.split('/')
  const parts2 = path2.split('/')
  if (parts1.length === 1 && parts1[0] === '') parts1.length = 0
  return parts1.length + 1 === parts2.length &&
         parts1.join('') === parts2.slice(0, -1).join('')
}

/**
 * Remove the first occurrence of an element from an array, and return that
 * element if found.
 */

exports.removeElement = function removeElement(arr, cb) {
  const elem = arr.find(cb)
  if (!elem) return
  const i = arr.indexOf(elem)
  arr.splice(i, 1)
  return elem
}

