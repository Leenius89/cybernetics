import eslintPluginReact from "eslint-plugin-react";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
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
      "import/first": "off",
    },
  },
];