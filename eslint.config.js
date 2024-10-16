import eslintPluginReact from "eslint-plugin-react";
import { createRequire } from 'module';
import { glob } from 'glob';
const require = createRequire(import.meta.url);

const files = await glob(['src/**/*.js', 'src/**/*.jsx'], { ignore: 'node_modules/**' });

export default [
  {
    files,
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: require("@babel/eslint-parser"),
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
    },
    plugins: {
      react: eslintPluginReact,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "import/first": "off",  // 이 줄을 추가하여 import/first 규칙을 비활성화합니다.
    },
  },
];