const invalidTokenError = () => {
  const error = new Error('token invalid')
  error.name = 'JsonWebTokenError'
  return error
}

module.exports = {
  invalidTokenError
}
