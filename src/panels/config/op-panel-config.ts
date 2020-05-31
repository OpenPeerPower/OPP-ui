import { property, PropertyValues, customElement } from "lit-element";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-item/paper-item";
import "../../layouts/opp-loading-screen";
import { isComponentLoaded } from "../../common/config/is_component_loaded";
import { OpenPeerPower, Route } from "../../types";
import { CloudStatus, fetchCloudStatus } from "../../data/cloud";
import { listenMediaQuery } from "../../common/dom/media_query";
import {
  getOptimisticFrontendUserDataCollection,
  CoreFrontendUserData,
} from "../../data/frontend";
import { OppRouterPage, RouterOptions } from "../../layouts/opp-router-page";
import { PolymerElement } from "@polymer/polymer";
import { PageNavigation } from "../../layouts/opp-tabs-subpage";

declare global {
  // for fire event
  interface OPPDomEvents {
    "op-refresh-cloud-status": undefined;
  }
}

export const configSections: { [name: string]: PageNavigation[] } = {
  integrations: [
    {
      component: "integrations",
      path: "/config/integrations",
      translationKey: "ui.panel.config.integrations.caption",
      icon: "opp:puzzle",
      core: true,
    },
    {
      component: "devices",
      path: "/config/devices",
      translationKey: "ui.panel.config.devices.caption",
      icon: "opp:devices",
      core: true,
    },
    {
      component: "entities",
      path: "/config/entities",
      translationKey: "ui.panel.config.entities.caption",
      icon: "opp:shape",
      core: true,
    },
    {
      component: "areas",
      path: "/config/areas",
      translationKey: "ui.panel.config.areas.caption",
      icon: "opp:sofa",
      core: true,
    },
  ],
  automation: [
    {
      component: "automation",
      path: "/config/automation",
      translationKey: "ui.panel.config.automation.caption",
      icon: "opp:robot",
    },
    {
      component: "scene",
      path: "/config/scene",
      translationKey: "ui.panel.config.scene.caption",
      icon: "opp:palette",
    },
    {
      component: "script",
      path: "/config/script",
      translationKey: "ui.panel.config.script.caption",
      icon: "opp:script-text",
    },
  ],
  persons: [
    {
      component: "person",
      path: "/config/person",
      translationKey: "ui.panel.config.person.caption",
      icon: "opp:account",
    },
    {
      component: "zone",
      path: "/config/zone",
      translationKey: "ui.panel.config.zone.caption",
      icon: "opp:map-marker-radius",
    },
    {
      component: "users",
      path: "/config/users",
      translationKey: "ui.panel.config.users.caption",
      icon: "opp:account-badge-horizontal",
      core: true,
    },
  ],
  general: [
    {
      component: "core",
      path: "/config/core",
      translationKey: "ui.panel.config.core.caption",
      icon: "opp:open-peer-power",
      core: true,
    },
    {
      component: "server_control",
      path: "/config/server_control",
      translationKey: "ui.panel.config.server_control.caption",
      icon: "opp:server",
      core: true,
    },
    {
      component: "customize",
      path: "/config/customize",
      translationKey: "ui.panel.config.customize.caption",
      icon: "opp:pencil",
      core: true,
      exportOnly: true,
    },
  ],
  other: [
    {
      component: "zha",
      path: "/config/zha",
      translationKey: "ui.panel.config.zha.caption",
      icon: "opp:zigbee",
    },
    {
      component: "zwave",
      path: "/config/zwave",
      translationKey: "ui.panel.config.zwave.caption",
      icon: "opp:z-wave",
    },
  ],
};

@customElement("op-panel-config")
class OpPanelConfig extends OppRouterPage {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public route!: Route;

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    cacheAll: true,
    preloadAll: true,
    routes: {
      areas: {
        tag: "op-config-areas",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-areas" */ "./areas/op-config-areas"
          ),
      },
      automation: {
        tag: "op-config-automation",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-automation" */ "./automation/op-config-automation"
          ),
      },
      cloud: {
        tag: "op-config-cloud",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-cloud" */ "./cloud/op-config-cloud"
          ),
      },
      core: {
        tag: "op-config-core",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-core" */ "./core/op-config-core"
          ),
      },
      devices: {
        tag: "op-config-devices",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-devices" */ "./devices/op-config-devices"
          ),
      },
      server_control: {
        tag: "op-config-server-control",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-server-control" */ "./server_control/op-config-server-control"
          ),
      },
      customize: {
        tag: "op-config-customize",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-customize" */ "./customize/op-config-customize"
          ),
      },
      dashboard: {
        tag: "op-config-dashboard",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-dashboard" */ "./dashboard/op-config-dashboard"
          ),
      },
      entities: {
        tag: "op-config-entities",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-entities" */ "./entities/op-config-entities"
          ),
      },
      integrations: {
        tag: "op-config-integrations",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-integrations" */ "./integrations/op-config-integrations"
          ),
      },
      person: {
        tag: "op-config-person",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-person" */ "./person/op-config-person"
          ),
      },
      script: {
        tag: "op-config-script",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-script" */ "./script/op-config-script"
          ),
      },
      scene: {
        tag: "op-config-scene",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-scene" */ "./scene/op-config-scene"
          ),
      },
      users: {
        tag: "op-config-users",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-users" */ "./users/op-config-users"
          ),
      },
      zone: {
        tag: "op-config-zone",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-zone" */ "./zone/op-config-zone"
          ),
      },
      zha: {
        tag: "zha-config-dashboard-router",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-zha" */ "./zha/zha-config-dashboard-router"
          ),
      },
      zwave: {
        tag: "op-config-zwave",
        load: () =>
          import(
            /* webpackChunkName: "panel-config-zwave" */ "./zwave/op-config-zwave"
          ),
      },
    },
  };

  @property() private _wideSidebar: boolean = false;
  @property() private _wide: boolean = false;
  @property() private _coreUserData?: CoreFrontendUserData;
  @property() private _showAdvanced = false;
  @property() private _cloudStatus?: CloudStatus;

  private _listeners: Array<() => void> = [];

  public connectedCallback() {
    super.connectedCallback();
    this._listeners.push(
      listenMediaQuery("(min-width: 1040px)", (matches) => {
        this._wide = matches;
      })
    );
    this._listeners.push(
      listenMediaQuery("(min-width: 1296px)", (matches) => {
        this._wideSidebar = matches;
      })
    );
    this._listeners.push(
      getOptimisticFrontendUserDataCollection(
        this.opp.connection,
        "core"
      ).subscribe((coreUserData) => {
        this._coreUserData = coreUserData || {};
        this._showAdvanced = !!(
          this._coreUserData && this._coreUserData.showAdvanced
        );
      })
    );
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    while (this._listeners.length) {
      this._listeners.pop()!();
    }
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    if (isComponentLoaded(this.opp, "cloud")) {
      this._updateCloudStatus();
    }
    this.addEventListener("op-refresh-cloud-status", () =>
      this._updateCloudStatus()
    );
    this.style.setProperty(
      "--app-header-background-color",
      "var(--sidebar-background-color)"
    );
    this.style.setProperty(
      "--app-header-text-color",
      "var(--sidebar-text-color)"
    );
    this.style.setProperty(
      "--app-header-border-bottom",
      "1px solid var(--divider-color)"
    );
  }

  protected updatePageEl(el) {
    const isWide =
      this.opp.dockedSidebar === "docked" ? this._wideSidebar : this._wide;

    if ("setProperties" in el) {
      // As long as we have Polymer panels
      (el as PolymerElement).setProperties({
        route: this.routeTail,
        opp: this.opp,
        showAdvanced: this._showAdvanced,
        isWide,
        narrow: this.narrow,
        cloudStatus: this._cloudStatus,
      });
    } else {
      el.route = this.routeTail;
      el.opp = this.opp;
      el.showAdvanced = this._showAdvanced;
      el.isWide = isWide;
      el.narrow = this.narrow;
      el.cloudStatus = this._cloudStatus;
    }
  }

  private async _updateCloudStatus() {
    this._cloudStatus = await fetchCloudStatus(this.opp);

    if (this._cloudStatus.cloud === "connecting") {
      setTimeout(() => this._updateCloudStatus(), 5000);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-panel-config": OpPanelConfig;
  }
}
