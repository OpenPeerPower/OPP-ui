import {
  OppRouterPage,
  RouterOptions,
} from "../../src/layouts/opp-router-page";
import { customElement, property } from "lit-element";
import { PolymerElement } from "@polymer/polymer";
import { OpenPeerPower } from "../../src/types";
// Don't codesplit it, that way the dashboard always loads fast.
import "./dashboard/oppio-dashboard";
// Don't codesplit the others, because it breaks the UI when pushed to a Pi
import "./snapshots/oppio-snapshots";
import "./addon-store/oppio-addon-store";
import "./system/oppio-system";
import { OppioHostInfo, OppioOppOSInfo } from "../../src/data/oppio/host";
import {
  OppioSupervisorInfo,
  OppioOpenPeerPowerInfo,
} from "../../src/data/oppio/supervisor";

@customElement("oppio-tabs-router")
class OppioTabsRouter extends OppRouterPage {
  @property() public opp!: OpenPeerPower;
  @property() public supervisorInfo: OppioSupervisorInfo;
  @property() public hostInfo: OppioHostInfo;
  @property() public oppInfo: OppioOpenPeerPowerInfo;
  @property() public oppOsInfo!: OppioOppOSInfo;

  protected routerOptions: RouterOptions = {
    routes: {
      dashboard: {
        tag: "oppio-dashboard",
      },
      snapshots: {
        tag: "oppio-snapshots",
      },
      store: {
        tag: "oppio-addon-store",
      },
      system: {
        tag: "oppio-system",
      },
    },
  };

  protected updatePageEl(el) {
    if ("setProperties" in el) {
      // As long as we have Polymer pages
      (el as PolymerElement).setProperties({
        opp: this.opp,
        supervisorInfo: this.supervisorInfo,
        hostInfo: this.hostInfo,
        oppInfo: this.oppInfo,
        oppOsInfo: this.oppOsInfo,
      });
    } else {
      el.opp = this.opp;
      el.supervisorInfo = this.supervisorInfo;
      el.hostInfo = this.hostInfo;
      el.oppInfo = this.oppInfo;
      el.oppOsInfo = this.oppOsInfo;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-tabs-router": OppioTabsRouter;
  }
}
