import { storeState } from "../util/op-pref-storage";
import { OppBaseEl } from "./opp-base-mixin";
import { OPPDomEvent } from "../common/dom/fire_event";
import { OpenPeerPower, Constructor } from "../types";

interface DockSidebarParams {
  dock: OpenPeerPower["dockedSidebar"];
}

declare global {
  // for fire event
  interface OPPDomEvents {
    "opp-dock-sidebar": DockSidebarParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "opp-dock-sidebar": OPPDomEvent<DockSidebarParams>;
  }
}

export default <T extends Constructor<OppBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("opp-dock-sidebar", (ev) => {
        this._updateOpp({ dockedSidebar: ev.detail.dock });
        storeState(this.opp!);
      });
    }
  };
