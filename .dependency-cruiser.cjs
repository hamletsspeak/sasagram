/** @type {import("dependency-cruiser").IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "ui-to-server",
      severity: "error",
      comment:
        "UI layers should not import server-only code directly. Go through app/api routes or shared client-safe abstractions.",
      from: {
        path: "^src/(components|features|shared)/",
      },
      to: {
        path: "^src/server/",
      },
    },
    {
      name: "ui-to-db",
      severity: "error",
      comment:
        "Client-facing modules should not depend on raw SQL or migration files.",
      from: {
        path: "^src/(app(?!/api/)|components|features|shared)/",
      },
      to: {
        path: "^src/db/",
      },
    },
    {
      name: "features-cross-import",
      severity: "warn",
      comment:
        "Keep features isolated. Shared logic belongs in shared/ or lib/ when it needs reuse.",
      from: {
        path: "^src/features/([^/]+)/",
      },
      to: {
        path: "^src/features/",
        pathNot: "^src/features/$1/",
      },
    },
  ],
  options: {
    tsConfig: {
      fileName: "tsconfig.json",
    },
    includeOnly: "^src",
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: [
        "\\.next/",
        "next-env\\.d\\.ts$",
        "\\.d\\.ts$",
      ],
    },
    reporterOptions: {
      dot: {
        collapsePattern:
          "^(node_modules|src/(app|components|db|features|lib|server|shared))",
        theme: {
          graph: {
            rankdir: "LR",
            splines: "ortho",
          },
        },
      },
    },
  },
};
