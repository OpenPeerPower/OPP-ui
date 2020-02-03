import { ConnectionOptions } from "../../types";
import { createSocket } from "./socket";
import { Connection } from "./connection";

export * from "./auth";
export * from "./collection";
export * from "./connection";
export * from "./config";
export * from "./services";
export * from "./entities";
export * from "./errors";
export * from "../../types";
export * from "./commands";
export * from "./store";
export * from "./socket";

const defaultConnectionOptions: ConnectionOptions = {
  setupRetry: 3,
  createSocket
};

export async function createConnection(options?: Partial<ConnectionOptions>) {
  const connOptions: ConnectionOptions = Object.assign(
    {},
    defaultConnectionOptions,
    options
  );
  const socket = await connOptions.createSocket(connOptions);
  const conn = new Connection(socket, connOptions);
  return conn;
}
