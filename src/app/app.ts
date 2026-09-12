import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import express, { Router, type Express } from "express";
import { errorMiddleware } from "./middlewares/error";
import { notFoundMiddleware } from "./middlewares/not-found";

const app: Express = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDirectory = path.resolve(__dirname, "./routes");

async function findRouteFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  const routeFiles: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedRouteFiles = await findRouteFiles(entryPath);

      routeFiles.push(...nestedRouteFiles);

      continue;
    }

    if (entry.isFile() && entry.name === "route.ts") {
      routeFiles.push(entryPath);
    }
  }

  return routeFiles;
}

async function loadApplicationRoutes(): Promise<void> {
  const routeFiles = await findRouteFiles(routesDirectory);

  for (const routeFile of routeFiles) {
    const moduleUrl = pathToFileURL(routeFile).href;

    const routeModule = await import(moduleUrl);

    const registerRoute = routeModule.default;

    const prefix = routeModule.prefix;

    if (
      typeof registerRoute !== "function" ||
      registerRoute.name !== "registerRoute"
    ) {
      console.warn(`Skipping invalid route module: ${routeFile}`);

      continue;
    }

    if (typeof prefix !== "string") {
      console.warn(`Skipping route without a valid prefix: ${routeFile}`);

      continue;
    }

    const router = Router();

    registerRoute(router);

    app.use(prefix, router);

    console.log(`Route loaded: ${prefix} -> ${routeFile}`);
  }
}

export async function createApp(): Promise<Express> {
  await loadApplicationRoutes();

  app.use(errorMiddleware);
  app.use(notFoundMiddleware)

  return app;
}
