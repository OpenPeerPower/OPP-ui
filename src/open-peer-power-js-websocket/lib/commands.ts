import { Connection } from "./connection";
import * as messages from "./messages";
import { OppServices, OppUser, OppEntity, OppConfig } from "../../types";

export const loginUser = (connection: Connection) =>
  connection.sendMessagePromise<OppUser>(messages.login());

export const getStates = (connection: Connection) =>
  connection.sendMessagePromise<OppEntity[]>(messages.states());

export const getServices = (connection: Connection) =>
  connection.sendMessagePromise<OppServices>(messages.services());

export const getConfig = (connection: Connection) =>
  connection.sendMessagePromise<OppConfig>(messages.config());

export const getUser = (connection: Connection) =>
  connection.sendMessagePromise<OppUser>(messages.user());

export const callService = (
  connection: Connection,
  domain: string,
  service: string,
  serviceData?: object
) =>
  connection.sendMessagePromise(
    messages.callService(domain, service, serviceData)
  );
