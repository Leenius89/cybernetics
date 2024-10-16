module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'import/first': 'off',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }]
  }
};