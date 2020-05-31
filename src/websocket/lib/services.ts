import { getCollection } from "./collection";
import { OppServices, OppDomainServices, UnsubscribeFunc } from "./types";
import { Connection } from "./connection";
import { Store } from "./store";
import { getServices } from "./commands";

type ServiceRegisteredEvent = {
  data: {
    domain: string;
    service: string;
  };
};

type ServiceRemovedEvent = {
  data: {
    domain: string;
    service: string;
  };
};

function processServiceRegistered(
  state: OppServices,
  event: ServiceRegisteredEvent
) {
  if (state === undefined) return null;

  const { domain, service } = event.data;

  const domainInfo = Object.assign({}, state[domain], {
    [service]: { description: "", fields: {} },
  });

  return { [domain]: domainInfo };
}

function processServiceRemoved(state: OppServices, event: ServiceRemovedEvent) {
  if (state === undefined) return null;

  const { domain, service } = event.data;
  const curDomainInfo = state[domain];

  if (!curDomainInfo || !(service in curDomainInfo)) return null;

  const domainInfo: OppDomainServices = {};
  Object.keys(curDomainInfo).forEach((sKey) => {
    if (sKey !== service) domainInfo[sKey] = curDomainInfo[sKey];
  });

  return { [domain]: domainInfo };
}

const fetchServices = (conn: Connection) => getServices(conn);
const subscribeUpdates = (conn: Connection, store: Store<OppServices>) =>
  Promise.all([
    conn.subscribeEvents<ServiceRegisteredEvent>(
      store.action(processServiceRegistered),
      "service_registered"
    ),
    conn.subscribeEvents<ServiceRemovedEvent>(
      store.action(processServiceRemoved),
      "service_removed"
    ),
  ]).then((unsubs) => () => unsubs.forEach((fn) => fn()));

const servicesColl = (conn: Connection) =>
  getCollection(conn, "_srv", fetchServices, subscribeUpdates);

export const subscribeServices = (
  conn: Connection,
  onChange: (state: OppServices) => void
): UnsubscribeFunc => servicesColl(conn).subscribe(onChange);
