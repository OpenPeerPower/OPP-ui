import { PropertyValues, property, UpdatingElement } from "lit-element";
import { UnsubscribeFunc } from "../websocket/lib";
import { OpenPeerPower, Constructor } from "../types";

export interface OppSubscribeElement {
  oppSubscribe(): UnsubscribeFunc[];
}

/* tslint:disable-next-line:variable-name */
export const SubscribeMixin = <T extends Constructor<UpdatingElement>>(
  superClass: T
) => {
  class SubscribeClass extends superClass {
    @property() public opp?: OpenPeerPower;

    /* tslint:disable-next-line:variable-name */
    private __unsubs?: UnsubscribeFunc[];

    public connectedCallback() {
      super.connectedCallback();
      this.__checkSubscribed();
    }

    public disconnectedCallback() {
      super.disconnectedCallback();
      if (this.__unsubs) {
        while (this.__unsubs.length) {
          this.__unsubs.pop()!();
        }
        this.__unsubs = undefined;
      }
    }

    protected updated(changedProps: PropertyValues) {
      super.updated(changedProps);
      if (changedProps.has("opp")) {
        this.__checkSubscribed();
      }
    }

    protected oppSubscribe(): UnsubscribeFunc[] {
      return [];
    }

    private __checkSubscribed(): void {
      if (
        this.__unsubs !== undefined ||
        !((this as unknown) as Element).isConnected ||
        this.opp === undefined
      ) {
        return;
      }
      this.__unsubs = this.oppSubscribe();
    }
  }
  return SubscribeClass;
};
