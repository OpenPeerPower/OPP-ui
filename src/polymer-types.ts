export const applyPolymerEvent = <T>(
  ev: PolymerChangedEvent<T>,
  curValue: T
): T => {
  const { path, value } = ev.detail;
  if (!path) {
    return value;
  }
  const propName = path.split(".")[1];
  return { ...curValue, [propName]: value };
};

export interface PolymerChangedEvent<T> extends Event {
  detail: {
    value: T;
    path?: string;
    queueProperty: boolean;
  };
}

export interface PolymerIronSelectEvent<T> extends Event {
  detail: {
    item: T;
  };
}

declare global {
  // for fire event
  interface OPPDomEvents {
    "opp-logout": undefined;
    "iron-resize": undefined;
    "config-refresh": undefined;
    "op-refresh-cloud-status": undefined;
    "opp-notification": {
      message: string;
    };
    "opp-api-called": {
      success: boolean;
      response: unknown;
    };
  }
}
