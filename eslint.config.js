import js from '@eslint/js';
export default [
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**'],
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      
    }
  }
];
