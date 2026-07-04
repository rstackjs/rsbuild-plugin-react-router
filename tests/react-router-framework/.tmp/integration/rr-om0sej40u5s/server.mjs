
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();
app.all(
  "/app/*",
  createRequestHandler({ build: await import("./build/server/index.js") })
);

const port = 39873;
app.listen(port, () => console.log('http://localhost:' + port));
                