/* eslint-env node */
module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals"],
  rules: {
    // Enforce FSD boundaries (simple form). Adjust as needed.
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "@features/*/internal",
              "@entities/*/internal",
              "@widgets/*/internal",
              "@processes/*/internal",
            ],
            message:
              "Do not import from internal paths; use the public API (index.ts).",
          },
        ],
      },
    ],
  },
};
