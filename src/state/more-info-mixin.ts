import { Constructor, LitElement } from "lit-element";

import { OppBaseEl } from "./opp-base-mixin";

declare global {
  // for fire event
  interface OPPDomEvents {
    "opp-more-info": {
      entityId: string | null;
    };
  }
}

export default (superClass: Constructor<LitElement & OppBaseEl>) =>
  class extends superClass {
    private _moreInfoEl?: any;

    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("opp-more-info", (e) => this._handleMoreInfo(e));

      // Load it once we are having the initial rendering done.
      import("../dialogs/op-more-info-dialog");
    }

    private async _handleMoreInfo(ev) {
      if (!this._moreInfoEl) {
        debugger;
        this._moreInfoEl = document.createElement("op-more-info-dialog");
        this.shadowRoot!.appendChild(this._moreInfoEl);
        this.provideOpp(this._moreInfoEl);
      }
      this._updateOpp({ moreInfoEntityId: ev.detail.entityId });
    }
  };
