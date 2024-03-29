module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "airbnb-typescript/base"
  ],
  "rules": {
    "@typescript-eslint/quotes": ["error", "double"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "max-classes-per-file": "off",
    "import/prefer-default-export": "off",
    "import/no-cycle": "off",
    "max-len": ["error", { "code": 120 }],
    "quotes": ["error", "double"],
    "no-underscore-dangle": "off",
    "no-await-in-loop": "off",
    "default-case": "off",
    "no-else-return": "off",
    "linebreak-style": ["error", "windows"]
  }
};
