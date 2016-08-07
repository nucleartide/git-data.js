
try {
  Promise
} catch (err) {
  if (err instanceof ReferenceError) Promise = require('promise')
}

