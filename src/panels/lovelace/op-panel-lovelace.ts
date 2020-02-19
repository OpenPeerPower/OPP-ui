import "@material/mwc-button";

import {
  fetchConfig,
  LovelaceConfig,
  saveConfig,
  subscribeLovelaceUpdates,
  WindowWithLovelaceProm,
} from "../../data/lovelace";
import "../../layouts/opp-loading-screen";
import "../../layouts/opp-error-screen";
import "./hui-root";
import { OpenPeerPower, PanelInfo, Route } from "../../types";
import { Lovelace } from "./types";
import {
  LitElement,
  html,
  PropertyValues,
  TemplateResult,
  property,
} from "lit-element";
import { showSaveDialog } from "./editor/show-save-config-dialog";
import { generateLovelaceConfigFromOpp } from "./common/generate-lovelace-config";
import { showToast } from "../../util/toast";

interface LovelacePanelConfig {
  mode: "yaml" | "storage";
}

let editorLoaded = false;

class LovelacePanel extends LitElement {
  @property() public panel?: PanelInfo<LovelacePanelConfig>;

  @property() public opp?: OpenPeerPower;

  @property() public narrow?: boolean;

  @property() public route?: Route;

  @property() private _columns?: number;

  @property()
  private _state?: "loading" | "loaded" | "error" | "yaml-editor" = "loading";

  @property() private _errorMsg?: string;

  @property() private lovelace?: Lovelace;

  private mqls?: MediaQueryList[];

  private _ignoreNextUpdateEvent = false;
  private _fetchConfigOnConnect = false;

  constructor() {
    super();
    debugger;
    this._closeEditor = this._closeEditor.bind(this);
  }

  public render(): TemplateResult | void {
    debugger;
    const state = this._state!;

    if (state === "loaded") {
      return html`
        <hui-root
          .opp="${this.opp}"
          .lovelace="${this.lovelace}"
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
          title="${this.opp!.localize("domain.lovelace")}"
          .error="${this._errorMsg}"
        >
          <mwc-button on-click="_forceFetchConfig"
            >${this.opp!.localize(
              "ui.panel.lovelace.reload_lovelace"
            )}</mwc-button
          >
        </opp-error-screen>
      `;
    }

    if (state === "yaml-editor") {
      return html`
        <hui-editor
          .opp="${this.opp}"
          .lovelace="${this.lovelace}"
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
    debugger;
    this._fetchConfig(false);
    // we don't want to unsub as we want to stay informed of updates
    subscribeLovelaceUpdates(this.opp!.connection, () =>
      this._lovelaceChanged()
    );
    // reload lovelace on reconnect so we are sure we have the latest config
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
    debugger;
    if (
      this.lovelace &&
      this.opp &&
      this.lovelace.language !== this.opp.language
    ) {
      // language has been changed, rebuild UI
      this._setLovelaceConfig(this.lovelace.config, this.lovelace.mode);
    } else if (this.lovelace && this.lovelace.mode === "generated") {
      // When lovelace is generated, we re-generate each time a user goes
      // to the states panel to make sure new entities are shown.
      this._state = "loading";
      this._regenerateConfig();
    } else if (this._fetchConfigOnConnect) {
      // Config was changed when we were not at the lovelace panel
      this._fetchConfig(false);
    }
  }

  private async _regenerateConfig() {
    const conf = await generateLovelaceConfigFromOpp(this.opp!);
    this._setLovelaceConfig(conf, "generated");
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

  private _lovelaceChanged() {
    if (this._ignoreNextUpdateEvent) {
      this._ignoreNextUpdateEvent = false;
      return;
    }
    if (!this.isConnected) {
      // We can't fire events from an element that is connected
      // Make sure we fetch the config as soon as the user goes back to Lovelace
      this._fetchConfigOnConnect = true;
      return;
    }
    showToast(this, {
      message: this.opp!.localize("ui.panel.lovelace.changed_toast.message"),
      action: {
        action: () => this._fetchConfig(false),
        text: this.opp!.localize("ui.panel.lovelace.changed_toast.refresh"),
      },
      duration: 0,
      dismissable: false,
    });
  }

  private _forceFetchConfig() {
    this._fetchConfig(true);
  }

  private async _fetchConfig(forceDiskRefresh: boolean) {
    let conf: LovelaceConfig;
    let confMode: Lovelace["mode"] = this.panel!.config.mode;
    let confProm: Promise<LovelaceConfig>;
    const llWindow = window as WindowWithLovelaceProm;

    // On first load, we speed up loading page by having LL promise ready
    if (llWindow.llConfProm) {
      confProm = llWindow.llConfProm;
      llWindow.llConfProm = undefined;
    } else {
      // Refreshing a YAML config can trigger an update event. We will ignore
      // all update events while fetching the config and for 2 seconds after the cnofig is back.
      // We ignore because we already have the latest config.
      if (this.lovelace && this.lovelace.mode === "yaml") {
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
      conf = await generateLovelaceConfigFromOpp(this.opp!);
      confMode = "generated";
    } finally {
      // Ignore updates for another 2 seconds.
      if (this.lovelace && this.lovelace.mode === "yaml") {
        setTimeout(() => {
          this._ignoreNextUpdateEvent = false;
        }, 2000);
      }
    }

    this._state = "loaded";
    this._setLovelaceConfig(conf, confMode);
  }

  private _checkLovelaceConfig(config: LovelaceConfig) {
    // Somehow there can be badges with value null, we remove those
    config.views.forEach((view) => {
      if (view.badges) {
        view.badges = view.badges.filter(Boolean);
      }
    });
  }

  private _setLovelaceConfig(config: LovelaceConfig, mode: Lovelace["mode"]) {
    this._checkLovelaceConfig(config);
    this.lovelace = {
      config,
      mode,
      editMode: this.lovelace ? this.lovelace.editMode : false,
      language: this.opp!.language,
      enableFullEditMode: () => {
        if (!editorLoaded) {
          editorLoaded = true;
          import(/* webpackChunkName: "lovelace-yaml-editor" */ "./hui-editor");
        }
        this._state = "yaml-editor";
      },
      setEditMode: (editMode: boolean) => {
        if (!editMode || this.lovelace!.mode !== "generated") {
          this._updateLovelace({ editMode });
          return;
        }
        showSaveDialog(this, {
          lovelace: this.lovelace!,
        });
      },
      saveConfig: async (newConfig: LovelaceConfig): Promise<void> => {
        const { config: previousConfig, mode: previousMode } = this.lovelace!;
        this._checkLovelaceConfig(newConfig);
        try {
          // Optimistic update
          this._updateLovelace({
            config: newConfig,
            mode: "storage",
          });
          this._ignoreNextUpdateEvent = true;
          await saveConfig(this.opp!, newConfig);
        } catch (err) {
          // tslint:disable-next-line
          console.error(err);
          // Rollback the optimistic update
          this._updateLovelace({
            config: previousConfig,
            mode: previousMode,
          });
          throw err;
        }
      },
    };
  }

  private _updateLovelace(props: Partial<Lovelace>) {
    this.lovelace = {
      ...this.lovelace!,
      ...props,
    };
  }
}

customElements.define("op-panel-lovelace", LovelacePanel);
