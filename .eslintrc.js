module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint",
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
      },
    },
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        trailingComma: "es5",
        endOfLine: "auto",
        printWidth: 80,
      },
    ],
    "import/extensions": "off",
  },
};
