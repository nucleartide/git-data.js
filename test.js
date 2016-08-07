
try {
  asdf
} catch (err) {
  if (err instanceof ReferenceError) asdf = require('promise')
}

