module.exports = {
  env: {
    commonjs: true,
    es2023: true,
    node: true
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'space-before-function-paren': [
      'error',
      'never'
    ]
  }
}
