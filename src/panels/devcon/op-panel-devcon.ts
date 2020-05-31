import "@material/mwc-button";
import deepFreeze from "deep-freeze";

import {
  fetchConfig,
  DevconConfig,
  saveConfig,
  subscribeDevconUpdates,
  WindowWithDevconProm,
  deleteConfig,
} from "../../data/devcon";
import "../../layouts/opp-loading-screen";
import "../../layouts/opp-error-screen";
import "./hui-root";
import { OpenPeerPower, PanelInfo, Route } from "../../types";
import { Devcon } from "./types";
import {
  LitElement,
  html,
  PropertyValues,
  TemplateResult,
  property,
} from "lit-element";
import { showSaveDialog } from "./editor/show-save-config-dialog";
import { generateDevconConfigFromOpp } from "./common/generate-devcon-config";
import { showToast } from "../../util/toast";

(window as any).loadCardHelpers = () => import("./custom-card-helpers");

interface DevconPanelConfig {
  mode: "yaml" | "storage";
}

let editorLoaded = false;

class DevconPanel extends LitElement {
  @property() public panel?: PanelInfo<DevconPanelConfig>;

  @property() public opp?: OpenPeerPower;

  @property() public narrow?: boolean;

  @property() public route?: Route;

  @property() private _columns?: number;

  @property()
  private _state?: "loading" | "loaded" | "error" | "yaml-editor" = "loading";

  @property() private _errorMsg?: string;

  @property() private devcon?: Devcon;

  private mqls?: MediaQueryList[];

  private _ignoreNextUpdateEvent = false;
  private _fetchConfigOnConnect = false;

  constructor() {
    super();
    this._closeEditor = this._closeEditor.bind(this);
  }

  public render(): TemplateResult | void {
    const state = this._state!;

    if (state === "loaded") {
      return html`
        <hui-root
          .opp="${this.opp}"
          .devcon="${this.devcon}"
          .route="${this.route}"
          .columns="${this._columns}"
          .narrow=${this.narrow}
          @config-refresh="${this._forceFetchConfig}"
        ></hui-root>
      `;
    }

    if (state === "error") {
      return html`
        <opp-error-screen
          title="${this.opp!.localize("domain.devcon")}"
          .error="${this._errorMsg}"
        >
          <mwc-button raised @click=${this._forceFetchConfig}>
            ${this.opp!.localize("ui.panel.devcon.reload_devcon")}
          </mwc-button>
        </opp-error-screen>
      `;
    }

    if (state === "yaml-editor") {
      return html`
        <hui-editor
          .opp="${this.opp}"
          .devcon="${this.devcon}"
          .closeEditor="${this._closeEditor}"
        ></hui-editor>
      `;
    }

    return html`
      <opp-loading-screen
        rootnav
        .opp=${this.opp}
        .narrow=${this.narrow}
      ></opp-loading-screen>
    `;
  }

  public updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    if (changedProps.has("narrow")) {
      this._updateColumns();
      return;
    }

    if (!changedProps.has("opp")) {
      return;
    }

    const oldOpp = changedProps.get("opp") as this["opp"];

    if (oldOpp && this.opp!.dockedSidebar !== oldOpp.dockedSidebar) {
      this._updateColumns();
    }
  }

  public firstUpdated() {
    this._fetchConfig(false);
    // we don't want to unsub as we want to stay informed of updates
    subscribeDevconUpdates(this.opp!.connection, () => this._devconChanged());
    // reload devcon on reconnect so we are sure we have the latest config
    window.addEventListener("connection-status", (ev) => {
      if (ev.detail === "connected") {
        this._fetchConfig(false);
      }
    });
    this._updateColumns = this._updateColumns.bind(this);
    this.mqls = [300, 600, 900, 1200].map((width) => {
      const mql = matchMedia(`(min-width: ${width}px)`);
      mql.addListener(this._updateColumns);
      return mql;
    });
    this._updateColumns();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.devcon && this.opp && this.devcon.language !== this.opp.language) {
      // language has been changed, rebuild UI
      this._setDevconConfig(this.devcon.config, this.devcon.mode);
    } else if (this.devcon && this.devcon.mode === "generated") {
      // When devcon is generated, we re-generate each time a user goes
      // to the states panel to make sure new entities are shown.
      this._state = "loading";
      this._regenerateConfig();
    } else if (this._fetchConfigOnConnect) {
      // Config was changed when we were not at the devcon panel
      this._fetchConfig(false);
    }
  }

  private async _regenerateConfig() {
    const conf = await generateDevconConfigFromOpp(this.opp!);
    this._setDevconConfig(conf, "generated");
    this._state = "loaded";
  }

  private _closeEditor() {
    this._state = "loaded";
  }

  private _updateColumns() {
    const matchColumns = this.mqls!.reduce(
      (cols, mql) => cols + Number(mql.matches),
      0
    );
    // Do -1 column if the menu is docked and open
    this._columns = Math.max(
      1,
      matchColumns -
        Number(!this.narrow && this.opp!.dockedSidebar === "docked")
    );
  }

  private _devconChanged() {
    if (this._ignoreNextUpdateEvent) {
      this._ignoreNextUpdateEvent = false;
      return;
    }
    if (!this.isConnected) {
      // We can't fire events from an element that is connected
      // Make sure we fetch the config as soon as the user goes back to Devcon
      this._fetchConfigOnConnect = true;
      return;
    }
    showToast(this, {
      message: this.opp!.localize("ui.panel.devcon.changed_toast.message"),
      action: {
        action: () => this._fetchConfig(false),
        text: this.opp!.localize("ui.panel.devcon.changed_toast.refresh"),
      },
      duration: 0,
      dismissable: false,
    });
  }

  private _forceFetchConfig() {
    this._fetchConfig(true);
  }

  private async _fetchConfig(forceDiskRefresh: boolean) {
    let conf: DevconConfig;
    let confMode: Devcon["mode"] = this.panel!.config.mode;
    let confProm: Promise<DevconConfig>;
    const llWindow = window as WindowWithDevconProm;

    // On first load, we speed up loading page by having LL promise ready
    if (llWindow.llConfProm) {
      confProm = llWindow.llConfProm;
      llWindow.llConfProm = undefined;
    } else {
      // Refreshing a YAML config can trigger an update event. We will ignore
      // all update events while fetching the config and for 2 seconds after the cnofig is back.
      // We ignore because we already have the latest config.
      if (this.devcon && this.devcon.mode === "yaml") {
        this._ignoreNextUpdateEvent = true;
      }

      confProm = fetchConfig(this.opp!.connection, forceDiskRefresh);
    }

    try {
      conf = await confProm;
    } catch (err) {
      if (err.code !== "config_not_found") {
        // tslint:disable-next-line
        console.log(err);
        this._state = "error";
        this._errorMsg = err.message;
        return;
      }
      conf = await generateDevconConfigFromOpp(this.opp!);
      confMode = "generated";
    } finally {
      // Ignore updates for another 2 seconds.
      if (this.devcon && this.devcon.mode === "yaml") {
        setTimeout(() => {
          this._ignoreNextUpdateEvent = false;
        }, 2000);
      }
    }

    this._state = "loaded";
    this._setDevconConfig(conf, confMode);
  }

  private _checkDevconConfig(config: DevconConfig) {
    // Somehow there can be badges with value null, we remove those
    let checkedConfig = !Object.isFrozen(config) ? config : undefined;
    config.views.forEach((view, index) => {
      if (view.badges && !view.badges.every(Boolean)) {
        checkedConfig = checkedConfig || {
          ...config,
          views: [...config.views],
        };
        checkedConfig.views[index] = { ...view };
        checkedConfig.views[index].badges = view.badges.filter(Boolean);
      }
    });
    return checkedConfig ? deepFreeze(checkedConfig) : config;
  }

  private _setDevconConfig(config: DevconConfig, mode: Devcon["mode"]) {
    config = this._checkDevconConfig(config);
    this.devcon = {
      config,
      mode,
      editMode: this.devcon ? this.devcon.editMode : false,
      language: this.opp!.language,
      enableFullEditMode: () => {
        if (!editorLoaded) {
          editorLoaded = true;
          import(/* webpackChunkName: "devcon-yaml-editor" */ "./hui-editor");
        }
        this._state = "yaml-editor";
      },
      setEditMode: (editMode: boolean) => {
        if (!editMode || this.devcon!.mode !== "generated") {
          this._updateDevcon({ editMode });
          return;
        }
        showSaveDialog(this, {
          devcon: this.devcon!,
        });
      },
      saveConfig: async (newConfig: DevconConfig): Promise<void> => {
        const { config: previousConfig, mode: previousMode } = this.devcon!;
        newConfig = this._checkDevconConfig(newConfig);
        try {
          // Optimistic update
          this._updateDevcon({
            config: newConfig,
            mode: "storage",
          });
          this._ignoreNextUpdateEvent = true;
          await saveConfig(this.opp!, newConfig);
        } catch (err) {
          // tslint:disable-next-line
          console.error(err);
          // Rollback the optimistic update
          this._updateDevcon({
            config: previousConfig,
            mode: previousMode,
          });
          throw err;
        }
      },
      deleteConfig: async (): Promise<void> => {
        const { config: previousConfig, mode: previousMode } = this.devcon!;
        try {
          // Optimistic update
          this._updateDevcon({
            config: await generateDevconConfigFromOpp(this.opp!),
            mode: "generated",
            editMode: false,
          });
          this._ignoreNextUpdateEvent = true;
          await deleteConfig(this.opp!);
        } catch (err) {
          // tslint:disable-next-line
          console.error(err);
          // Rollback the optimistic update
          this._updateDevcon({
            config: previousConfig,
            mode: previousMode,
          });
          throw err;
        }
      },
    };
  }

  private _updateDevcon(props: Partial<Devcon>) {
    this.devcon = {
      ...this.devcon!,
      ...props,
    };
  }
}

customElements.define("op-panel-devcon", DevconPanel);
