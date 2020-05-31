import {
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
  CSSResult,
  css,
  property,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-scroll-effects/effects/waterfall";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/app-route/app-route";
import "@polymer/paper-icon-button/paper-icon-button";
import "@material/mwc-button";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-menu-button/paper-menu-button";
import "@polymer/paper-tabs/paper-tab";
import "@polymer/paper-tabs/paper-tabs";

import scrollToTarget from "../../common/dom/scroll-to-target";

import "../../layouts/op-app-layout";
import "../../components/op-paper-icon-button-arrow-next";
import "../../components/op-paper-icon-button-arrow-prev";
import "../../components/op-icon";
import { debounce } from "../../common/util/debounce";
import { OpenPeerPower } from "../../types";
import { DevconConfig } from "../../data/devcon";
import { navigate } from "../../common/navigate";
import { fireEvent } from "../../common/dom/fire_event";
import { swapView } from "./editor/config-util";

import "./views/hui-view";
// Not a duplicate import, this one is for type
// tslint:disable-next-line
import { HUIView } from "./views/hui-view";
import "./views/hui-panel-view";
// tslint:disable-next-line
import { HUIPanelView } from "./views/hui-panel-view";
import { showEditViewDialog } from "./editor/view-editor/show-edit-view-dialog";
import { showEditDevconDialog } from "./editor/devcon-editor/show-edit-devcon-dialog";
import { Devcon } from "./types";
import { afterNextRender } from "../../common/util/render-status";
import { opStyle } from "../../resources/styles";
import { computeRTLDirection } from "../../common/util/compute_rtl";
import { loadDevconResources } from "./common/load-resources";
import { showVoiceCommandDialog } from "../../dialogs/voice-command-dialog/show-op-voice-command-dialog";
import { isComponentLoaded } from "../../common/config/is_component_loaded";
import { showAlertDialog } from "../../dialogs/generic/show-dialog-box";
import memoizeOne from "memoize-one";

class HUIRoot extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public devcon?: Devcon;
  @property() public columns?: number;
  @property() public narrow?: boolean;
  @property() public route?: { path: string; prefix: string };
  @property() private _routeData?: { view: string };
  @property() private _curView?: number | "opp-unused-entities";
  private _viewCache?: { [viewId: string]: HUIView };

  private _debouncedConfigChanged: () => void;

  private _conversation = memoizeOne((_components) =>
    isComponentLoaded(this.opp, "conversation")
  );

  constructor() {
    super();
    // The view can trigger a re-render when it knows that certain
    // web components have been loaded.
    this._debouncedConfigChanged = debounce(
      () => this._selectView(this._curView, true),
      100,
      false
    );
  }

  protected render(): TemplateResult {
    return html`
    <app-route .route="${this.route}" pattern="/:view" data="${
      this._routeData
    }" @data-changed="${this._routeDataChanged}"></app-route>
    <op-app-layout id="layout">
      <app-header slot="header" effects="waterfall" class="${classMap({
        "edit-mode": this._editMode,
      })}" fixed condenses>
        ${
          this._editMode
            ? html`
                <app-toolbar class="edit-mode">
                  <paper-icon-button
                    aria-label="${this.opp!.localize(
                      "ui.panel.devcon.menu.exit_edit_mode"
                    )}"
                    title="${this.opp!.localize("ui.panel.devcon.menu.close")}"
                    icon="opp:close"
                    @click="${this._editModeDisable}"
                  ></paper-icon-button>
                  <div main-title>
                    ${this.config.title ||
                      this.opp!.localize("ui.panel.devcon.editor.header")}
                    <paper-icon-button
                      aria-label="${this.opp!.localize(
                        "ui.panel.devcon.editor.edit_devcon.edit_title"
                      )}"
                      title="${this.opp!.localize(
                        "ui.panel.devcon.editor.edit_devcon.edit_title"
                      )}"
                      icon="opp:pencil"
                      class="edit-icon"
                      @click="${this._editDevcon}"
                    ></paper-icon-button>
                  </div>
                  <paper-icon-button
                    icon="opp:help-circle"
                    title="${this.opp!.localize("ui.panel.devcon.menu.help")}"
                    @click="${this._handleHelp}"
                  ></paper-icon-button>
                  <paper-menu-button
                    no-animations
                    horizontal-align="right"
                    horizontal-offset="-5"
                  >
                    <paper-icon-button
                      aria-label=${this.opp!.localize(
                        "ui.panel.devcon.editor.menu.open"
                      )}
                      title="${this.opp!.localize(
                        "ui.panel.devcon.editor.menu.open"
                      )}"
                      icon="opp:dots-vertical"
                      slot="dropdown-trigger"
                    ></paper-icon-button>
                    <paper-listbox
                      @iron-select="${this._deselect}"
                      slot="dropdown-content"
                    >
                      ${__DEMO__ /* No unused entities available in the demo */
                        ? ""
                        : html`
                            <paper-item
                              aria-label=${this.opp!.localize(
                                "ui.panel.devcon.unused_entities.title"
                              )}
                              @tap="${this._handleUnusedEntities}"
                            >
                              ${this.opp!.localize(
                                "ui.panel.devcon.unused_entities.title"
                              )}
                            </paper-item>
                          `}
                      <paper-item @tap="${this.devcon!.enableFullEditMode}">
                        ${this.opp!.localize(
                          "ui.panel.devcon.editor.menu.raw_editor"
                        )}
                      </paper-item>
                    </paper-listbox>
                  </paper-menu-button>
                </app-toolbar>
              `
            : html`
                <app-toolbar>
                  <op-menu-button
                    .opp=${this.opp}
                    .narrow=${this.narrow}
                  ></op-menu-button>
                  <div main-title>
                    ${this.config.title || "Open Peer Power"}
                  </div>
                  ${this._conversation(this.opp.config.components)
                    ? html`
                        <paper-icon-button
                          aria-label="Start conversation"
                          icon="opp:microphone"
                          @click=${this._showVoiceCommandDialog}
                        ></paper-icon-button>
                      `
                    : ""}
                  <paper-menu-button
                    no-animations
                    horizontal-align="right"
                    horizontal-offset="-5"
                  >
                    <paper-icon-button
                      aria-label=${this.opp!.localize(
                        "ui.panel.devcon.editor.menu.open"
                      )}
                      title="${this.opp!.localize(
                        "ui.panel.devcon.editor.menu.open"
                      )}"
                      icon="opp:dots-vertical"
                      slot="dropdown-trigger"
                    ></paper-icon-button>
                    <paper-listbox
                      @iron-select="${this._deselect}"
                      slot="dropdown-content"
                    >
                      ${this._yamlMode
                        ? html`
                            <paper-item
                              aria-label=${this.opp!.localize(
                                "ui.panel.devcon.menu.refresh"
                              )}
                              @tap="${this._handleRefresh}"
                            >
                              ${this.opp!.localize(
                                "ui.panel.devcon.menu.refresh"
                              )}
                            </paper-item>
                            <paper-item
                              aria-label=${this.opp!.localize(
                                "ui.panel.devcon.unused_entities.title"
                              )}
                              @tap="${this._handleUnusedEntities}"
                            >
                              ${this.opp!.localize(
                                "ui.panel.devcon.unused_entities.title"
                              )}
                            </paper-item>
                          `
                        : ""}
                      ${this.opp!.user!.is_admin && !this.opp!.config.safe_mode
                        ? html`
                            <paper-item
                              aria-label=${this.opp!.localize(
                                "ui.panel.devcon.menu.configure_ui"
                              )}
                              @tap="${this._editModeEnable}"
                            >
                              ${this.opp!.localize(
                                "ui.panel.devcon.menu.configure_ui"
                              )}
                            </paper-item>
                          `
                        : ""}
                      <paper-item
                        aria-label=${this.opp!.localize(
                          "ui.panel.devcon.menu.help"
                        )}
                        @tap="${this._handleHelp}"
                      >
                        ${this.opp!.localize("ui.panel.devcon.menu.help")}
                      </paper-item>
                    </paper-listbox>
                  </paper-menu-button>
                </app-toolbar>
              `
        }

        ${
          this.devcon!.config.views.length > 1 || this._editMode
            ? html`
                <div sticky>
                  <paper-tabs
                    scrollable
                    .selected="${this._curView}"
                    @iron-activate="${this._handleViewSelected}"
                    dir="${computeRTLDirection(this.opp!)}"
                  >
                    ${this.devcon!.config.views.map(
                      (view) => html`
                        <paper-tab
                          aria-label="${view.title}"
                          class="${classMap({
                            "hide-tab": Boolean(
                              !this._editMode &&
                                view.visible !== undefined &&
                                ((Array.isArray(view.visible) &&
                                  !view.visible.some(
                                    (e) => e.user === this.opp!.user!.id
                                  )) ||
                                  view.visible === false)
                            ),
                          })}"
                        >
                          ${this._editMode
                            ? html`
                                <op-paper-icon-button-arrow-prev
                                  title="${this.opp!.localize(
                                    "ui.panel.devcon.editor.edit_view.move_left"
                                  )}"
                                  class="edit-icon view"
                                  @click="${this._moveViewLeft}"
                                  ?disabled="${this._curView === 0}"
                                ></op-paper-icon-button-arrow-prev>
                              `
                            : ""}
                          ${view.icon
                            ? html`
                                <op-icon
                                  title="${view.title}"
                                  .icon="${view.icon}"
                                ></op-icon>
                              `
                            : view.title || "Unnamed view"}
                          ${this._editMode
                            ? html`
                                <op-icon
                                  title="${this.opp!.localize(
                                    "ui.panel.devcon.editor.edit_view.edit"
                                  )}"
                                  class="edit-icon view"
                                  icon="opp:pencil"
                                  @click="${this._editView}"
                                ></op-icon>
                                <op-paper-icon-button-arrow-next
                                  title="${this.opp!.localize(
                                    "ui.panel.devcon.editor.edit_view.move_right"
                                  )}"
                                  class="edit-icon view"
                                  @click="${this._moveViewRight}"
                                  ?disabled="${(this._curView! as number) +
                                    1 ===
                                    this.devcon!.config.views.length}"
                                ></op-paper-icon-button-arrow-next>
                              `
                            : ""}
                        </paper-tab>
                      `
                    )}
                    ${this._editMode
                      ? html`
                          <paper-icon-button
                            id="add-view"
                            @click="${this._addView}"
                            title="${this.opp!.localize(
                              "ui.panel.devcon.editor.edit_view.add"
                            )}"
                            icon="opp:plus"
                          ></paper-icon-button>
                        `
                      : ""}
                  </paper-tabs>
                </div>
              `
            : ""
        }
      </app-header>
      <div id='view' class="${classMap({
        "tabs-hidden": this.devcon!.config.views.length < 2,
      })}" @ll-rebuild='${this._debouncedConfigChanged}'></div>
    </app-header-layout>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        :host {
          --dark-color: #455a64;
          --text-dark-color: #fff;
          -ms-user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
        }

        op-app-layout {
          min-height: 100%;
        }
        paper-menu-button {
          padding: 0;
        }
        paper-tabs {
          margin-left: 12px;
          --paper-tabs-selection-bar-color: var(--text-primary-color, #fff);
          text-transform: uppercase;
        }
        .edit-mode {
          background-color: var(--dark-color, #455a64);
          color: var(--text-dark-color);
        }
        .edit-mode div[main-title] {
          pointer-events: auto;
        }
        paper-tab.iron-selected .edit-icon {
          display: inline-flex;
        }
        .edit-icon {
          color: var(--accent-color);
          padding-left: 8px;
        }
        .edit-icon[disabled] {
          color: var(--disabled-text-color);
        }
        .edit-icon.view {
          display: none;
        }
        #add-view {
          position: absolute;
          height: 44px;
        }
        #add-view op-icon {
          background-color: var(--accent-color);
          border-radius: 5px;
          margin-top: 4px;
        }
        app-toolbar a {
          color: var(--text-primary-color, white);
        }
        mwc-button.warning:not([disabled]) {
          color: var(--google-red-500);
        }
        #view {
          min-height: calc(100vh - 112px);
          /**
          * Since we only set min-height, if child nodes need percentage
          * heights they must use absolute positioning so we need relative
          * positioning here.
          *
          * https://www.w3.org/TR/CSS2/visudet.html#the-height-property
          */
          position: relative;
          display: flex;
        }
        #view > * {
          /**
          * The view could get larger than the window in Firefox
          * to prevent that we set the max-width to 100%
          * flex-grow: 1 and flex-basis: 100% should make sure the view
          * stays full width.
          *
          * https://github.com/open-peer-power/open-peer-power-polymer/pull/3806
          */
          flex: 1 1 100%;
          max-width: 100%;
        }
        #view.tabs-hidden {
          min-height: calc(100vh - 64px);
        }
        paper-item {
          cursor: pointer;
        }
        .hide-tab {
          display: none;
        }
      `,
    ];
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    const view = this._viewRoot;
    const huiView = view.lastChild as HUIView | HUIPanelView;

    if (
      changedProperties.has("columns") &&
      huiView &&
      huiView instanceof HUIView
    ) {
      huiView.columns = this.columns;
    }

    if (changedProperties.has("opp") && huiView) {
      huiView.opp = this.opp;
    }

    let newSelectView;
    let force = false;

    if (changedProperties.has("route")) {
      const views = this.config && this.config.views;
      if (
        this.route!.path === "" &&
        this.route!.prefix === "/devcon" &&
        views
      ) {
        navigate(this, `/devcon/${views[0].path || 0}`, true);
        newSelectView = 0;
      } else if (this._routeData!.view === "opp-unused-entities") {
        newSelectView = "opp-unused-entities";
      } else if (this._routeData!.view) {
        const selectedView = this._routeData!.view;
        const selectedViewInt = parseInt(selectedView, 10);
        let index = 0;
        for (let i = 0; i < views.length; i++) {
          if (views[i].path === selectedView || i === selectedViewInt) {
            index = i;
            break;
          }
        }
        newSelectView = index;
      }
    }

    if (changedProperties.has("devcon")) {
      const oldDevcon = changedProperties.get("devcon") as Devcon | undefined;

      if (!oldDevcon || oldDevcon.config !== this.devcon!.config) {
        if (this.devcon!.config.resources) {
          loadDevconResources(
            this.devcon!.config.resources,
            this.opp!.auth.data.oppUrl
          );
        }
        // On config change, recreate the current view from scratch.
        force = true;
        // Recalculate to see if we need to adjust content area for tab bar
        fireEvent(this, "iron-resize");
      }

      if (!oldDevcon || oldDevcon.editMode !== this.devcon!.editMode) {
        // Leave unused entities when leaving edit mode
        if (
          this.devcon!.mode === "storage" &&
          this._routeData!.view === "opp-unused-entities"
        ) {
          const views = this.config && this.config.views;
          navigate(this, `/devcon/${views[0].path || 0}`);
          newSelectView = 0;
        }
        // On edit mode change, recreate the current view from scratch
        force = true;
        // Recalculate to see if we need to adjust content area for tab bar
        fireEvent(this, "iron-resize");
      }
    }

    if (newSelectView !== undefined || force) {
      if (force && newSelectView === undefined) {
        newSelectView = this._curView;
      }
      // Will allow for ripples to start rendering
      afterNextRender(() => this._selectView(newSelectView, force));
    }
  }

  private get config(): DevconConfig {
    return this.devcon!.config;
  }

  private get _yamlMode(): boolean {
    return this.devcon!.mode === "yaml";
  }

  private get _editMode() {
    return this.devcon!.editMode;
  }

  private get _layout(): any {
    return this.shadowRoot!.getElementById("layout");
  }

  private get _viewRoot(): HTMLDivElement {
    return this.shadowRoot!.getElementById("view") as HTMLDivElement;
  }

  private _routeDataChanged(ev): void {
    this._routeData = ev.detail.value;
  }

  private _handleRefresh(): void {
    fireEvent(this, "config-refresh");
  }

  private _handleUnusedEntities(): void {
    navigate(this, `/devcon/opp-unused-entities`);
  }

  private _deselect(ev): void {
    ev.target.selected = null;
  }

  private _showVoiceCommandDialog(): void {
    showVoiceCommandDialog(this);
  }

  private _handleHelp(): void {
    window.open("https://www.open-peer-power.io/devcon/", "_blank");
  }

  private _editModeEnable(): void {
    if (this._yamlMode) {
      showAlertDialog(this, {
        text: "The edit UI is not available when in YAML mode.",
      });
      return;
    }
    this.devcon!.setEditMode(true);
    if (this.config.views.length < 2) {
      fireEvent(this, "iron-resize");
    }
  }

  private _editModeDisable(): void {
    this.devcon!.setEditMode(false);
    if (this.config.views.length < 2) {
      fireEvent(this, "iron-resize");
    }
  }

  private _editDevcon() {
    showEditDevconDialog(this, this.devcon!);
  }

  private _editView() {
    showEditViewDialog(this, {
      devcon: this.devcon!,
      viewIndex: this._curView as number,
    });
  }

  private _moveViewLeft() {
    const devcon = this.devcon!;
    const oldIndex = this._curView as number;
    const newIndex = (this._curView as number) - 1;
    this._curView = newIndex;
    devcon.saveConfig(swapView(devcon.config, oldIndex, newIndex));
  }

  private _moveViewRight() {
    const devcon = this.devcon!;
    const oldIndex = this._curView as number;
    const newIndex = (this._curView as number) + 1;
    this._curView = newIndex;
    devcon.saveConfig(swapView(devcon.config, oldIndex, newIndex));
  }

  private _addView() {
    showEditViewDialog(this, {
      devcon: this.devcon!,
    });
  }

  private _handleViewSelected(ev) {
    const viewIndex = ev.detail.selected as number;

    if (viewIndex !== this._curView) {
      const path = this.config.views[viewIndex].path || viewIndex;
      navigate(this, `/devcon/${path}`);
    }
    scrollToTarget(this, this._layout.header.scrollTarget);
  }

  private _selectView(viewIndex: HUIRoot["_curView"], force: boolean): void {
    if (!force && this._curView === viewIndex) {
      return;
    }

    viewIndex = viewIndex === undefined ? 0 : viewIndex;

    this._curView = viewIndex;

    if (force) {
      this._viewCache = {};
    }

    // Recreate a new element to clear the applied themes.
    const root = this._viewRoot;

    if (root.lastChild) {
      root.removeChild(root.lastChild);
    }

    if (viewIndex === "opp-unused-entities") {
      const unusedEntities = document.createElement("hui-unused-entities");
      // Wait for promise to resolve so that the element has been upgraded.
      import(
        /* webpackChunkName: "hui-unused-entities" */ "./editor/unused-entities/hui-unused-entities"
      ).then(() => {
        unusedEntities.opp = this.opp!;
        unusedEntities.devcon = this.devcon!;
        unusedEntities.narrow = this.narrow;
      });
      if (this.config.background) {
        unusedEntities.style.setProperty(
          "--devcon-background",
          this.config.background
        );
      }
      root.appendChild(unusedEntities);
      return;
    }

    let view;
    const viewConfig = this.config.views[viewIndex];

    if (!viewConfig) {
      this._editModeEnable();
      return;
    }

    if (!force && this._viewCache![viewIndex]) {
      view = this._viewCache![viewIndex];
    } else {
      if (viewConfig.panel && viewConfig.cards && viewConfig.cards.length > 0) {
        view = document.createElement("hui-panel-view");
        view.config = viewConfig;
      } else {
        view = document.createElement("hui-view");
        view.devcon = this.devcon;
        view.columns = this.columns;
        view.index = viewIndex;
      }
      this._viewCache![viewIndex] = view;
    }

    view.opp = this.opp;

    const configBackground = viewConfig.background || this.config.background;

    if (configBackground) {
      view.style.setProperty("--devcon-background", configBackground);
    }

    root.appendChild(view);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-root": HUIRoot;
  }
}

customElements.define("hui-root", HUIRoot);
