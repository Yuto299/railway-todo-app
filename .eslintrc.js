module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // PrettierをESLintのルールとして追加
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020, // 最新のECMAScript構文をサポート
    sourceType: 'module', // ESモジュールをサポート
  },
  rules: {
    'prettier/prettier': 'error', // Prettierのルールをエラーとして扱う
  },
};
