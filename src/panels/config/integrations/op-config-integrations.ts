import "@polymer/app-route/app-route";
import { property, customElement, PropertyValues } from "lit-element";

import "./op-config-entries-dashboard";
import "./config-entry/op-config-entry-page";
import { compare } from "../../../common/string/compare";
import {
  subscribeAreaRegistry,
  AreaRegistryEntry,
} from "../../../data/area_registry";
import { OppRouterPage, RouterOptions } from "../../../layouts/opp-router-page";
import { OpenPeerPower } from "../../../types";
import { ConfigEntry, getConfigEntries } from "../../../data/config_entries";
import {
  EntityRegistryEntry,
  subscribeEntityRegistry,
} from "../../../data/entity_registry";
import {
  DeviceRegistryEntry,
  subscribeDeviceRegistry,
} from "../../../data/device_registry";
import { UnsubscribeFunc } from "../../../websocket/lib";
import { DataEntryFlowProgress } from "../../../data/data_entry_flow";
import {
  subscribeConfigFlowInProgress,
  getConfigFlowInProgressCollection,
} from "../../../data/config_flow";

declare global {
  interface OPPDomEvents {
    "opp-reload-entries": undefined;
  }
}

@customElement("op-config-integrations")
class OpConfigIntegrations extends OppRouterPage {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() public showAdvanced!: boolean;

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    routes: {
      dashboard: {
        tag: "op-config-entries-dashboard",
      },
      config_entry: {
        tag: "op-config-entry-page",
      },
    },
  };

  @property() private _configEntries: ConfigEntry[] = [];
  @property() private _configEntriesInProgress: DataEntryFlowProgress[] = [];
  @property() private _entityRegistryEntries: EntityRegistryEntry[] = [];
  @property() private _deviceRegistryEntries: DeviceRegistryEntry[] = [];
  @property() private _areas: AreaRegistryEntry[] = [];

  private _unsubs?: UnsubscribeFunc[];

  public connectedCallback() {
    super.connectedCallback();

    if (!this.opp) {
      return;
    }
    this._loadData();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubs) {
      while (this._unsubs.length) {
        this._unsubs.pop()!();
      }
      this._unsubs = undefined;
    }
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.addEventListener("opp-reload-entries", () => {
      this._loadData();
      getConfigFlowInProgressCollection(this.opp.connection).refresh();
    });
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (!this._unsubs && changedProps.has("opp")) {
      this._loadData();
    }
  }

  protected updatePageEl(pageEl) {
    pageEl.opp = this.opp;

    pageEl.entityRegistryEntries = this._entityRegistryEntries;
    pageEl.configEntries = this._configEntries;
    pageEl.narrow = this.narrow;
    pageEl.isWide = this.isWide;
    pageEl.showAdvanced = this.showAdvanced;
    pageEl.route = this.routeTail;
    if (this._currentPage === "dashboard") {
      pageEl.configEntriesInProgress = this._configEntriesInProgress;
      return;
    }

    pageEl.configEntryId = this.routeTail.path.substr(1);
    pageEl.deviceRegistryEntries = this._deviceRegistryEntries;
    pageEl.areas = this._areas;
  }

  private _loadData() {
    getConfigEntries(this.opp).then((configEntries) => {
      this._configEntries = configEntries.sort((conf1, conf2) =>
        compare(conf1.domain + conf1.title, conf2.domain + conf2.title)
      );
    });
    if (this._unsubs) {
      return;
    }
    this._unsubs = [
      subscribeAreaRegistry(this.opp.connection, (areas) => {
        this._areas = areas;
      }),
      subscribeEntityRegistry(this.opp.connection, (entries) => {
        this._entityRegistryEntries = entries;
      }),
      subscribeDeviceRegistry(this.opp.connection, (entries) => {
        this._deviceRegistryEntries = entries;
      }),
      subscribeConfigFlowInProgress(this.opp, (flowsInProgress) => {
        this._configEntriesInProgress = flowsInProgress;
      }),
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-config-integrations": OpConfigIntegrations;
  }
}
