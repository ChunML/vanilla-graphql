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
  rules: {
    "prettier/prettier": "error",
  },
};
