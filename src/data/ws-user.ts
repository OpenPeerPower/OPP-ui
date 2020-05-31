import { getUser, Connection, getCollection } from "../websocket/lib";
import { CurrentUser } from "../types";

export const userCollection = (conn: Connection) =>
  getCollection(
    conn,
    "_usr",
    () => getUser(conn) as Promise<CurrentUser>,
    undefined
  );

export const subscribeUser = (
  conn: Connection,
  onChange: (user: CurrentUser) => void
) => userCollection(conn).subscribe(onChange);
