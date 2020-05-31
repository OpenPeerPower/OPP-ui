import { customElement, PropertyValues, property } from "lit-element";
import { PolymerElement } from "@polymer/polymer";
import "@polymer/paper-icon-button";

import "../../src/resources/op-style";
import { applyThemesOnElement } from "../../src/common/dom/apply_themes_on_element";
import { fireEvent } from "../../src/common/dom/fire_event";
import {
  OppRouterPage,
  RouterOptions,
} from "../../src/layouts/opp-router-page";
import { OpenPeerPower } from "../../src/types";
import {
  fetchOppioSupervisorInfo,
  fetchOppioOpenPeerPowerInfo,
  OppioSupervisorInfo,
  OppioOpenPeerPowerInfo,
  createOppioSession,
  OppioPanelInfo,
} from "../../src/data/oppio/supervisor";
import {
  fetchOppioHostInfo,
  fetchOppioOppOsInfo,
  OppioHostInfo,
  OppioOppOSInfo,
} from "../../src/data/oppio/host";
import { fetchOppioAddonInfo } from "../../src/data/oppio/addon";
import { makeDialogManager } from "../../src/dialogs/make-dialog-manager";
import { ProvideOppLitMixin } from "../../src/mixins/provide-opp-lit-mixin";
// Don't codesplit it, that way the dashboard always loads fast.
import "./oppio-pages-with-tabs";
import { navigate } from "../../src/common/navigate";
import {
  showAlertDialog,
  AlertDialogParams,
} from "../../src/dialogs/generic/show-dialog-box";

// The register callback of the IronA11yKeysBehavior inside paper-icon-button
// is not called, causing _keyBindings to be uninitiliazed for paper-icon-button,
// causing an exception when added to DOM. When transpiled to ES5, this will
// break the build.
customElements.get("paper-icon-button").prototype._keyBindings = {};

@customElement("oppio-main")
class OppioMain extends ProvideOppLitMixin(OppRouterPage) {
  @property() public opp!: OpenPeerPower;
  @property() public panel!: OppioPanelInfo;
  @property() public narrow!: boolean;

  protected routerOptions: RouterOptions = {
    // Opp.io has a page with tabs, so we route all non-matching routes to it.
    defaultPage: "dashboard",
    initialLoad: () => this._fetchData(),
    showLoading: true,
    routes: {
      dashboard: {
        tag: "oppio-pages-with-tabs",
        cache: true,
      },
      snapshots: "dashboard",
      store: "dashboard",
      system: "dashboard",
      addon: {
        tag: "oppio-addon-view",
        load: () =>
          import(
            /* webpackChunkName: "oppio-addon-view" */ "./addon-view/oppio-addon-view"
          ),
      },
      ingress: {
        tag: "oppio-ingress-view",
        load: () =>
          import(
            /* webpackChunkName: "oppio-ingress-view" */ "./ingress-view/oppio-ingress-view"
          ),
      },
    },
  };
  @property() private _supervisorInfo: OppioSupervisorInfo;
  @property() private _hostInfo: OppioHostInfo;
  @property() private _oppOsInfo?: OppioOppOSInfo;
  @property() private _oppInfo: OppioOpenPeerPowerInfo;

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    applyThemesOnElement(
      this.parentElement,
      this.opp.themes,
      this.opp.selectedTheme,
      true
    );
    this.addEventListener("opp-api-called", (ev) => this._apiCalled(ev));
    // Paulus - March 17, 2019
    // We went to a single opp-toggle-menu event in HA 0.90. However, the
    // supervisor UI can also run under older versions of Open Peer Power.
    // So here we are going to translate toggle events into the appropriate
    // open and close events. These events are a no-op in newer versions of
    // Open Peer Power.
    this.addEventListener("opp-toggle-menu", () => {
      fireEvent(
        (window.parent as any).customPanel,
        // @ts-ignore
        this.opp.dockedSidebar ? "opp-close-menu" : "opp-open-menu"
      );
    });
    // Paulus - March 19, 2019
    // We changed the navigate event to fire directly on the window, as that's
    // where we are listening for it. However, the older panel_custom will
    // listen on this element for navigation events, so we need to forward them.
    window.addEventListener("location-changed", (ev) =>
      // @ts-ignore
      fireEvent(this, ev.type, ev.detail, {
        bubbles: false,
      })
    );

    // Forward haptic events to parent window.
    window.addEventListener("haptic", (ev) => {
      // @ts-ignore
      fireEvent(window.parent, ev.type, ev.detail, {
        bubbles: false,
      });
    });

    makeDialogManager(this, document.body);
  }

  protected updatePageEl(el) {
    // the tabs page does its own routing so needs full route.
    const route =
      el.nodeName === "OPPIO-PAGES-WITH-TABS" ? this.route : this.routeTail;

    if ("setProperties" in el) {
      // As long as we have Polymer pages
      (el as PolymerElement).setProperties({
        opp: this.opp,
        narrow: this.narrow,
        supervisorInfo: this._supervisorInfo,
        hostInfo: this._hostInfo,
        oppInfo: this._oppInfo,
        oppOsInfo: this._oppOsInfo,
        route,
      });
    } else {
      el.opp = this.opp;
      el.narrow = this.narrow;
      el.supervisorInfo = this._supervisorInfo;
      el.hostInfo = this._hostInfo;
      el.oppInfo = this._oppInfo;
      el.oppOsInfo = this._oppOsInfo;
      el.route = route;
    }
  }

  private async _fetchData() {
    if (this.panel.config && this.panel.config.ingress) {
      await this._redirectIngress(this.panel.config.ingress);
      return;
    }

    const [supervisorInfo, hostInfo, oppInfo] = await Promise.all([
      fetchOppioSupervisorInfo(this.opp),
      fetchOppioHostInfo(this.opp),
      fetchOppioOpenPeerPowerInfo(this.opp),
    ]);
    this._supervisorInfo = supervisorInfo;
    this._hostInfo = hostInfo;
    this._oppInfo = oppInfo;

    if (this._hostInfo.features && this._hostInfo.features.includes("oppos")) {
      this._oppOsInfo = await fetchOppioOppOsInfo(this.opp);
    }
  }

  private async _redirectIngress(addonSlug: string) {
    // When we trigger a navigation, we sleep to make sure we don't
    // show the oppio dashboard before navigating away.
    const awaitAlert = async (
      alertParams: AlertDialogParams,
      action: () => void
    ) => {
      await new Promise((resolve) => {
        alertParams.confirm = resolve;
        showAlertDialog(this, alertParams);
      });
      action();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    const createSessionPromise = createOppioSession(this.opp).then(
      () => true,
      () => false
    );

    let addon;

    try {
      addon = await fetchOppioAddonInfo(this.opp, addonSlug);
    } catch (err) {
      await awaitAlert(
        {
          text: "Unable to fetch add-on info to start Ingress",
          title: "Opp.io",
        },
        () => history.back()
      );

      return;
    }

    if (!addon.ingress_url) {
      await awaitAlert(
        {
          text: "Add-on does not support Ingress",
          title: addon.name,
        },
        () => history.back()
      );

      return;
    }

    if (addon.state !== "started") {
      await awaitAlert(
        {
          text: "Add-on is not running. Please start it first",
          title: addon.name,
        },
        () => navigate(this, `/oppio/addon/${addon.slug}`, true)
      );

      return;
    }

    if (!(await createSessionPromise)) {
      await awaitAlert(
        {
          text: "Unable to create an Ingress session",
          title: addon.name,
        },
        () => history.back()
      );

      return;
    }

    location.assign(addon.ingress_url);
    // await a promise that doesn't resolve, so we show the loading screen
    // while we load the next page.
    await new Promise(() => undefined);
  }

  private _apiCalled(ev) {
    if (!ev.detail.success) {
      return;
    }

    let tries = 1;

    const tryUpdate = () => {
      this._fetchData().catch(() => {
        tries += 1;
        setTimeout(tryUpdate, Math.min(tries, 5) * 1000);
      });
    };

    tryUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-main": OppioMain;
  }
}
