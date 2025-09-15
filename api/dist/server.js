var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/tsup/assets/esm_shims.js
import path from "path";
import { fileURLToPath } from "url";
var init_esm_shims = __esm({
  "node_modules/tsup/assets/esm_shims.js"() {
    "use strict";
  }
});

// node_modules/fastify-plugin/lib/getPluginName.js
var require_getPluginName = __commonJS({
  "node_modules/fastify-plugin/lib/getPluginName.js"(exports, module) {
    "use strict";
    init_esm_shims();
    var fpStackTracePattern = /at\s{1}(?:.*\.)?plugin\s{1}.*\n\s*(.*)/;
    var fileNamePattern = /(\w*(\.\w*)*)\..*/;
    module.exports = function getPluginName(fn) {
      if (fn.name.length > 0) return fn.name;
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 10;
      try {
        throw new Error("anonymous function");
      } catch (e) {
        Error.stackTraceLimit = stackTraceLimit;
        return extractPluginName(e.stack);
      }
    };
    function extractPluginName(stack) {
      const m = stack.match(fpStackTracePattern);
      return m ? m[1].split(/[/\\]/).slice(-1)[0].match(fileNamePattern)[1] : "anonymous";
    }
    module.exports.extractPluginName = extractPluginName;
  }
});

// node_modules/fastify-plugin/lib/toCamelCase.js
var require_toCamelCase = __commonJS({
  "node_modules/fastify-plugin/lib/toCamelCase.js"(exports, module) {
    "use strict";
    init_esm_shims();
    module.exports = function toCamelCase(name) {
      if (name[0] === "@") {
        name = name.slice(1).replace("/", "-");
      }
      return name.replace(/-(.)/g, function(match, g1) {
        return g1.toUpperCase();
      });
    };
  }
});

// node_modules/fastify-plugin/plugin.js
var require_plugin = __commonJS({
  "node_modules/fastify-plugin/plugin.js"(exports, module) {
    "use strict";
    init_esm_shims();
    var getPluginName = require_getPluginName();
    var toCamelCase = require_toCamelCase();
    var count = 0;
    function plugin(fn, options = {}) {
      let autoName = false;
      if (fn.default !== void 0) {
        fn = fn.default;
      }
      if (typeof fn !== "function") {
        throw new TypeError(
          `fastify-plugin expects a function, instead got a '${typeof fn}'`
        );
      }
      if (typeof options === "string") {
        options = {
          fastify: options
        };
      }
      if (typeof options !== "object" || Array.isArray(options) || options === null) {
        throw new TypeError("The options object should be an object");
      }
      if (options.fastify !== void 0 && typeof options.fastify !== "string") {
        throw new TypeError(`fastify-plugin expects a version string, instead got '${typeof options.fastify}'`);
      }
      if (!options.name) {
        autoName = true;
        options.name = getPluginName(fn) + "-auto-" + count++;
      }
      fn[Symbol.for("skip-override")] = options.encapsulate !== true;
      fn[Symbol.for("fastify.display-name")] = options.name;
      fn[Symbol.for("plugin-meta")] = options;
      if (!fn.default) {
        fn.default = fn;
      }
      const camelCase = toCamelCase(options.name);
      if (!autoName && !fn[camelCase]) {
        fn[camelCase] = fn;
      }
      return fn;
    }
    module.exports = plugin;
    module.exports.default = plugin;
    module.exports.fastifyPlugin = plugin;
  }
});

// src/server.ts
init_esm_shims();

// src/app.ts
init_esm_shims();
import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

// src/plugins/cors.ts
init_esm_shims();
var import_fastify_plugin = __toESM(require_plugin(), 1);
import cors from "@fastify/cors";
var corsPlugin = async (fastify) => {
  await fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });
};
var cors_default = (0, import_fastify_plugin.default)(corsPlugin, {
  name: "cors-plugin"
});

// src/routes/health.ts
init_esm_shims();
async function healthRoutes(fastify, options) {
  fastify.get("/health", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
            service: { type: "string" }
          }
        }
      }
    }
  }, async () => {
    return {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "status-page-api"
    };
  });
}

// src/routes/profile.ts
init_esm_shims();

// src/middleware/auth.ts
init_esm_shims();

// src/utils/env.ts
init_esm_shims();
import "dotenv/config";
var PORT = Number(process.env.PORT) || 3e3;
var OIDC_ISSUER = process.env.OIDC_ISSUER;
var OIDC_AUDIENCE = process.env.OIDC_AUDIENCE;
var CORS_ORIGIN = process.env.CORS_ORIGIN;
var SECRET_KEY = process.env.SECRET_KEY;
var validateEnvironment = () => {
  if (!OIDC_ISSUER || !OIDC_AUDIENCE || !CORS_ORIGIN || !SECRET_KEY) {
    console.error("\u274C Missing required environment variables");
    console.error("Required: OIDC_ISSUER, OIDC_AUDIENCE, CORS_ORIGIN, SECRET_KEY");
    process.exit(1);
  }
};

// src/middleware/auth.ts
var authKeycloak = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      reply.status(401).send({ error: "No token provided" });
      return;
    }
    const response = await fetch(`${OIDC_ISSUER}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Keycloak - Token verification failed:", response.status, errorText);
      reply.status(401).send({ code: 401, message: "Keycloak: Invalid token" });
      return;
    }
    const userInfo = await response.json();
    request.user = userInfo;
  } catch (error) {
    console.error("Keycloak - Token verification error:", error);
    reply.status(401).send({ error: "Keycloak: Token verification failed" });
  }
};

// src/routes/profile.ts
async function profileRoutes(fastify, options) {
  fastify.get("/profile", {
    preHandler: [authKeycloak],
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            name: { type: "string" }
          }
        },
        401: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request) => {
    return {
      id: request.user.sub,
      username: request.user.preferred_username,
      email: request.user.email,
      name: request.user.name
    };
  });
}

// src/routes/reports.ts
init_esm_shims();

// src/service/reports.ts
init_esm_shims();
async function fetchReports(api, secret) {
  const response = await fetch(`${api}/api/v2/reports`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": `${secret}`
    }
  });
  if (!response.ok) {
    throw new Error(`Remote API failed: ${response.status} ${response.statusText}`);
  }
  const remote = await response.json();
  const reports = remote.data.map((item) => ({
    name: item.info.name,
    description: item.info.description
  }));
  return reports;
}

// src/utils/crypto.ts
init_esm_shims();
import CryptoJS from "crypto-js";
var encryptSecret = (secret) => {
  const secretKey = SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY environment variable is required");
  }
  return CryptoJS.AES.encrypt(secret, secretKey).toString();
};
var decryptSecret = (encryptedSecret) => {
  const secretKey = SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY environment variable is required");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedSecret, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// src/routes/reports.ts
async function reportRoutes(fastify, options) {
  fastify.post("/reports", {
    preHandler: [authKeycloak],
    schema: {
      body: {
        type: "object",
        required: ["api", "secret"],
        properties: {
          api: {
            type: "string",
            minLength: 1
          },
          secret: {
            type: "string",
            minLength: 1
          }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "description"],
            properties: {
              name: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        401: {
          type: "object",
          properties: {
            code: { type: "number" },
            message: { type: "string" }
          }
        },
        500: {
          type: "object",
          properties: {
            code: { type: "number" },
            message: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { api, secret } = request.body;
    try {
      const reports = await fetchReports(api, decryptSecret(secret));
      console.log(reports);
      return reports;
    } catch (err) {
      console.log("oups an error happened!");
      console.error(err);
      reply.code(500);
      return {
        code: 500,
        message: JSON.stringify(err)
      };
    }
  });
}

// src/routes/groups.ts
init_esm_shims();

// src/service/groups.ts
init_esm_shims();
async function fetchGroups(api, secret, report) {
  const response = await fetch(`${api}/api/v3/status/${report}?view=latest`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "x-api-key": `${secret}`
    }
  });
  if (!response.ok) {
    throw new Error(`Remote API failed: ${response.status} ${response.statusText}`);
  }
  const remote = await response.json();
  if (remote.groups == null) {
    return [];
  }
  return remote.groups.map((group) => ({
    name: group.name,
    status: group.statuses[0]?.value ?? "UNKNOWN"
  }));
}

// src/routes/groups.ts
async function groupRoutes(fastify, options) {
  fastify.post("/status/groups", {
    preHandler: [authKeycloak],
    schema: {
      body: {
        type: "object",
        required: ["api", "secret"],
        properties: {
          api: {
            type: "string",
            minLength: 1
          },
          secret: {
            type: "string",
            minLength: 1
          },
          report: {
            type: "string",
            minLength: 1
          }
        },
        additionalProperties: false
      },
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "status"],
            properties: {
              name: { type: "string" },
              status: { type: "string" }
            }
          }
        },
        401: {
          type: "object",
          properties: {
            code: { type: "number" },
            message: { type: "string" }
          }
        },
        500: {
          type: "object",
          properties: {
            code: { type: "number" },
            message: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { api, secret, report } = request.body;
    try {
      const groups = await fetchGroups(api, decryptSecret(secret), report);
      return groups;
    } catch (err) {
      console.log("oups an error happened!");
      console.error(err);
      reply.code(500);
      return {
        code: 500,
        message: JSON.stringify(err)
      };
    }
  });
}

// src/routes/pages.ts
init_esm_shims();
var pageRoutes = async (fastify) => {
  fastify.post("/pages", {
    preHandler: [authKeycloak],
    schema: {
      body: {
        type: "object",
        required: ["name", "api", "secret", "report", "groups"],
        properties: {
          name: { type: "string" },
          api: { type: "string", format: "uri" },
          secret: { type: "string" },
          report: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "alias", "list"],
              properties: {
                name: { type: "string" },
                alias: { type: "string" },
                list: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["name", "status"],
                    properties: {
                      name: { type: "string" },
                      status: { type: "string" },
                      alias: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, slug, api, secret, report, groups } = request.body;
      const { user } = request;
      if (!name || !api || !user?.sub || !secret || !report || !groups) {
        reply.code(400);
        return {
          success: false,
          error: "Missing required fields"
        };
      }
      if (!Array.isArray(groups) || groups.length === 0) {
        reply.code(400);
        return {
          success: false,
          error: "Groups must be a non-empty array"
        };
      }
      const client = await fastify.pg.connect();
      try {
        const result = await client.query(
          `INSERT INTO pages (name, slug, user_id, api, secret, report, groups, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
           RETURNING *`,
          [name, slug, user?.sub, api, secret, report, JSON.stringify(groups)]
        );
        reply.code(201);
        return {
          success: true,
          data: result.rows[0]
        };
      } finally {
        client.release();
      }
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error) {
        if (error.message.includes("duplicate key")) {
          reply.code(400);
          return {
            success: false,
            error: "Page with this name already exists for this user"
          };
        }
      }
      reply.code(500);
      return {
        success: false,
        error: "Failed to create page"
      };
    }
  });
  fastify.put("/pages/:id", {
    preHandler: [authKeycloak],
    schema: {
      body: {
        type: "object",
        required: ["name", "api", "secret", "report", "groups"],
        properties: {
          name: { type: "string" },
          api: { type: "string", format: "uri" },
          secret: { type: "string" },
          report: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "alias", "list"],
              properties: {
                name: { type: "string" },
                alias: { type: "string" },
                list: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["name", "status"],
                    properties: {
                      name: { type: "string" },
                      status: { type: "string" },
                      alias: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, slug, api, secret, report, groups } = request.body;
      const { id } = request.params;
      const { user } = request;
      if (!name || !api || !user?.sub || !secret || !report || !groups) {
        reply.code(400);
        return {
          success: false,
          error: "Missing required fields"
        };
      }
      if (!Array.isArray(groups) || groups.length === 0) {
        reply.code(400);
        return {
          success: false,
          error: "Groups must be a non-empty array"
        };
      }
      const client = await fastify.pg.connect();
      try {
        const existingPage = await client.query(
          "SELECT id FROM pages WHERE id = $1 AND user_id = $2",
          [id, user?.sub]
        );
        if (existingPage.rows.length === 0) {
          reply.code(404);
          return {
            success: false,
            error: "Page not found"
          };
        }
        const result = await client.query(
          `UPDATE pages 
           SET name = $1, slug = $2, api = $3, secret = $4, report = $5, groups = $6, updated_at = NOW()
           WHERE id = $7 AND user_id = $8
           RETURNING *`,
          [name, slug, api, secret, report, JSON.stringify(groups), id, user?.sub]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      fastify.log.error(error);
      if (error instanceof Error) {
        if (error.message.includes("duplicate key")) {
          reply.code(400);
          return {
            success: false,
            error: "Page with this name already exists for this user"
          };
        }
      }
      reply.code(500);
      return {
        success: false,
        error: "Failed to update page"
      };
    }
  });
  fastify.get("/pages", {
    preHandler: [authKeycloak]
  }, async (request, reply) => {
    try {
      const { user } = request;
      const client = await fastify.pg.connect();
      try {
        const result = await client.query(
          "SELECT id, name, slug, report, api, created_at, updated_at FROM pages WHERE user_id = $1 ORDER BY created_at DESC",
          [user?.sub]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: "Failed to fetch pages"
      };
    }
  });
  fastify.get("/pages/:id", {
    preHandler: [authKeycloak]
  }, async (request, reply) => {
    try {
      const { user } = request;
      const { id } = request.params;
      const client = await fastify.pg.connect();
      try {
        const result = await client.query(
          "SELECT * FROM pages WHERE id = $1 AND user_id = $2",
          [id, user?.sub]
        );
        if (result.rows.length === 0) {
          reply.code(404);
          return {
            success: false,
            error: "Page not found"
          };
        }
        return result.rows[0];
      } finally {
        client.release();
      }
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: "Failed to fetch page"
      };
    }
  });
  fastify.get("/pages/check-slug/:slug", {
    preHandler: [authKeycloak]
  }, async (request, reply) => {
    try {
      const { slug } = request.params;
      const { user } = request;
      const client = await fastify.pg.connect();
      try {
        const result = await client.query(
          "SELECT id FROM pages WHERE slug = $1 AND user_id = $2",
          [slug, user?.sub]
        );
        return {
          slug,
          available: result.rows.length === 0
        };
      } finally {
        client.release();
      }
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: "Failed to check slug availability"
      };
    }
  });
};
var pages_default = pageRoutes;

// src/plugins/postgres.ts
init_esm_shims();
var import_fastify_plugin2 = __toESM(require_plugin(), 1);
import postgres from "@fastify/postgres";
var postgresPlugin = async (fastify) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  await fastify.register(postgres, {
    // Use the imported module
    connectionString
  });
};
var postgres_default = (0, import_fastify_plugin2.default)(postgresPlugin, {
  name: "postgres"
});

// src/routes/encrypt.ts
init_esm_shims();
async function encryptRoutes(fastify, options) {
  fastify.post("/encrypt", {
    schema: {
      body: {
        type: "object",
        required: ["secret"],
        properties: {
          secret: { type: "string" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            secret: { type: "string" }
          }
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { secret } = request.body;
      if (!secret || secret.trim() === "") {
        reply.code(400);
        return {
          error: "Secret cannot be empty"
        };
      }
      const encryptedSecret = encryptSecret(secret);
      return {
        secret: encryptedSecret
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: "Failed to encrypt secret"
      };
    }
  });
}

// src/routes/status.ts
init_esm_shims();
var statusRoutes = async (fastify) => {
  fastify.get("/status/:slug", {}, async (request, reply) => {
    try {
      const { slug } = request.params;
      const client = await fastify.pg.connect();
      let page;
      try {
        const result = await client.query(
          "SELECT * FROM pages WHERE slug = $1",
          [slug]
        );
        if (result.rows.length === 0) {
          reply.code(404);
          return {
            success: false,
            error: "Page not found"
          };
        }
        page = result.rows[0];
      } finally {
        client.release();
      }
      const groups = await fetchGroups(page.api, decryptSecret(page.secret), page.report);
      const statusMap = groups.reduce((acc, group) => {
        acc[group.name] = group.status;
        return acc;
      }, {});
      return {
        ...page,
        api: "",
        secret: "",
        groups: page.groups.map((g) => ({
          ...g,
          list: g.list.map((item) => ({ ...item, status: statusMap[item.name] }))
        }))
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: "Failed to fetch page"
      };
    }
  });
};
var status_default = statusRoutes;

// src/app.ts
var createApp = async () => {
  const app = Fastify({
    logger: {
      level: "info",
      transport: {
        target: "pino-pretty"
      }
    }
  });
  await app.register(cors_default);
  await app.register(postgres_default);
  await app.register(swagger, {
    openapi: {
      info: {
        title: "ARGO Status Pages API",
        description: "API to create/edit status pages for argo-web-api results",
        version: "1.0.0"
      }
    }
  });
  await app.register(swaggerUI, {
    routePrefix: "/docs"
  });
  await app.register(healthRoutes, { prefix: "/v1" });
  await app.register(profileRoutes, { prefix: "/v1" });
  await app.register(reportRoutes, { prefix: "/v1" });
  await app.register(groupRoutes, { prefix: "/v1" });
  await app.register(pages_default, { prefix: "/v1" });
  await app.register(encryptRoutes, { prefix: "/v1" });
  await app.register(status_default, { prefix: "/v1" });
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error, "Fastify error");
    if (error.validation) {
      reply.code(400).send({
        error: "Validation Error",
        message: error.message,
        details: error.validation
      });
      return;
    }
    reply.code(500).send({
      error: "Internal Server Error",
      message: error.message
    });
  });
  return app;
};

// src/server.ts
var start = async () => {
  validateEnvironment();
  try {
    const app = await createApp();
    await app.listen({
      port: PORT,
      host: "0.0.0.0"
    });
    console.log(`\u{1F680} Server running on http://localhost:${PORT}`);
    const gracefulShutdown = async (signal) => {
      console.log(`Received ${signal}, shutting down gracefully`);
      try {
        await app.close();
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
      }
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};
start();
//# sourceMappingURL=server.js.map