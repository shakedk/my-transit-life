import nextConfig from "eslint-config-next";

export default [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "dist/**"],
  },
  ...nextConfig,
  {
    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];


