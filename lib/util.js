
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

/**
 * Check if `path2` is a direct descendant of `path1`.
 */

exports.isDirectChild = function isDirectChild(path1, path2) {
  const segments1 = path1.split('/')
  const segments2 = path2.split('/')
  if (segments1.length === 1 && segments1[0] === '') segments1.length = 0
  return segments1.length + 1 === segments2.length &&
         segments1.join('') === segments2.slice(0, -1).join('')
}

