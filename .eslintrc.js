module.exports = {
  extends: ['react-app'],
  rules: {
    'import/first': 'off',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal'],
      'pathGroups': [
        {
          pattern: 'react',
          group: 'external',
          position: 'before'
        }
      ],
      'pathGroupsExcludedImportTypes': ['react'],
      'newlines-between': 'always',
      'alphabetize': {
        order: 'asc',
        caseInsensitive: true
      }
    }]
  }
};