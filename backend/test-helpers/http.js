const http = require("node:http");

const express = require("express");

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function textResponse(status, body) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain",
    },
  });
}

function createFetchStub(responseFactory) {
  // Service tests use this in place of network calls while still recording the
  // exact URL and headers the client would have sent.
  const calls = [];

  const fetchImpl = async (url, init = {}) => {
    const call = {
      url: url.toString(),
      init,
    };

    calls.push(call);
    return responseFactory(call, calls.length - 1);
  };

  return {
    calls,
    fetchImpl,
  };
}

function createAppWithRouter(basePath, router) {
  // Route tests mount one router at a time so assertions stay focused on that
  // public API surface.
  const app = express();
  app.use(express.json());
  app.use(basePath, router);
  return app;
}

async function withServer(app, callback) {
  // Node's fetch works against a real local HTTP server, which gives route tests
  // realistic request parsing without binding to a fixed port.
  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    return await callback(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

async function requestJson(app, path, options = {}) {
  return withServer(app, async (baseUrl) => {
    const headers = {
      ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(options.headers ?? {}),
    };
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined
          ? undefined
          : typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body),
    });
    const text = await response.text();

    return {
      status: response.status,
      body: text ? JSON.parse(text) : null,
      headers: response.headers,
    };
  });
}

module.exports = {
  createAppWithRouter,
  createFetchStub,
  jsonResponse,
  requestJson,
  textResponse,
  withServer,
};
