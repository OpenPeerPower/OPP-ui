import { UpdatingElement, PropertyValues } from "lit-element";
import { OpenPeerPower, Constructor } from "../types";

export interface ProvideOppElement {
  provideOpp(element: HTMLElement);
}

/* tslint:disable-next-line:variable-name */
export const ProvideOppLitMixin = <T extends Constructor<UpdatingElement>>(
  superClass: T
) =>
  class extends superClass {
    protected opp!: OpenPeerPower;
    /* tslint:disable-next-line:variable-name */
    private __provideOpp: HTMLElement[] = [];

    public provideOpp(el) {
      this.__provideOpp.push(el);
      el.opp = this.opp;
    }

    protected updated(changedProps: PropertyValues) {
      super.updated(changedProps);

      if (changedProps.has("opp")) {
        this.__provideOpp.forEach((el) => {
          (el as any).opp = this.opp;
        });
      }
    }
  };
