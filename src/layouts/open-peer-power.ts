import "@polymer/app-route/app-location";
import { html, PropertyValues, property } from "lit-element";

import "./open-peer-power-main";
import "./op-init-page";
import "../resources/op-style";
import "../resources/custom-card-support";
import { registerServiceWorker } from "../util/register-service-worker";
import { DEFAULT_PANEL } from "../common/const";

import { Route, OpenPeerPower } from "../types";
import { navigate } from "../common/navigate";
import { OppElement } from "../state/opp-element";

export class OpenPeerPowerAppEl extends OppElement {
  @property() private _route?: Route;
  @property() private _error = false;
  @property() private _panelUrl?: string;

  protected render() {
    const opp = this.opp;

    return html`
      <app-location
        @route-changed=${this._routeChanged}
        ?use-hash-as-path=${__DEMO__}
      ></app-location>
      ${this._panelUrl === undefined || this._route === undefined
        ? ""
        : opp && opp.states && opp.config && opp.services
        ? html`
            <open-peer-power-main
              .opp=${this.opp}
              .route=${this._route}
            ></open-peer-power-main>
          `
        : html`
            <op-init-page .error=${this._error}></op-init-page>
          `}
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._initialize();
    setTimeout(registerServiceWorker, 1000);
    /* polyfill for paper-dropdown */
    import(
      /* webpackChunkName: "polyfill-web-animations-next" */ "web-animations-js/web-animations-next-lite.min"
    );
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("_panelUrl")) {
      this.panelUrlChanged(this._panelUrl!);
      this._updateOpp({ panelUrl: this._panelUrl });
    }
    if (changedProps.has("opp")) {
      this.oppChanged(
        this.opp!,
        changedProps.get("opp") as OpenPeerPower | undefined
      );
    }
  }

  protected async _initialize() {
    try {
      const { auth, conn } = await window.oppConnection;
      this.initializeOpp(auth, conn);
    } catch (err) {
      this._error = true;
      return;
    }
  }

  private async _routeChanged(ev) {
    // routeChanged event listener is called while we're doing the fist render,
    // causing the update to be ignored. So delay it to next task (Lit render is sync).
    await new Promise((resolve) => setTimeout(resolve, 0));

    const route = ev.detail.value as Route;
    // If it's the first route that we process,
    // check if we should navigate away from /
    if (
      this._route === undefined &&
      (route.path === "" || route.path === "/")
    ) {
      navigate(window, `/${localStorage.defaultPage || DEFAULT_PANEL}`, true);
      return;
    }

    this._route = route;

    const dividerPos = route.path.indexOf("/", 1);
    this._panelUrl =
      dividerPos === -1
        ? route.path.substr(1)
        : route.path.substr(1, dividerPos - 1);
  }
}

customElements.define("open-peer-power", OpenPeerPowerAppEl);
