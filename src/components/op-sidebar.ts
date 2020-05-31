import {
  LitElement,
  html,
  CSSResult,
  css,
  PropertyValues,
  property,
  eventOptions,
} from "lit-element";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "./op-icon";

import "../components/user/op-user-badge";
import "../components/op-menu-button";
import { OpenPeerPower, PanelInfo } from "../types";
import { fireEvent } from "../common/dom/fire_event";
import { DEFAULT_PANEL } from "../common/const";
import {
  getExternalConfig,
  ExternalConfig,
} from "../external_app/external_config";
import {
  PersistentNotification,
  subscribeNotifications,
} from "../data/persistent_notification";
import { computeDomain } from "../common/entity/compute_domain";
import { classMap } from "lit-html/directives/class-map";
// tslint:disable-next-line: no-duplicate-imports
import { PaperIconItemElement } from "@polymer/paper-item/paper-icon-item";
import { computeRTL } from "../common/util/compute_rtl";

const SHOW_AFTER_SPACER = ["config", "developer-tools", "oppio"];

const SUPPORT_SCROLL_IF_NEEDED = "scrollIntoViewIfNeeded" in document.body;

const SORT_VALUE_URL_PATHS = {
  map: 1,
  logbook: 2,
  history: 3,
  "developer-tools": 9,
  oppio: 10,
  config: 11,
};

const panelSorter = (a, b) => {
  const aBuiltIn = a.url_path in SORT_VALUE_URL_PATHS;
  const bBuiltIn = b.url_path in SORT_VALUE_URL_PATHS;

  if (aBuiltIn && bBuiltIn) {
    return SORT_VALUE_URL_PATHS[a.url_path] - SORT_VALUE_URL_PATHS[b.url_path];
  }
  if (aBuiltIn) {
    return -1;
  }
  if (bBuiltIn) {
    return 1;
  }
  // both not built in, sort by title
  if (a.title! < b.title!) {
    return -1;
  }
  if (a.title! > b.title!) {
    return 1;
  }
  return 0;
};

const computePanels = (opp: OpenPeerPower): [PanelInfo[], PanelInfo[]] => {
  const panels = opp.panels;
  if (!panels) {
    return [[], []];
  }

  const beforeSpacer: PanelInfo[] = [];
  const afterSpacer: PanelInfo[] = [];

  Object.values(panels).forEach((panel) => {
    if (!panel.title) {
      return;
    }
    (SHOW_AFTER_SPACER.includes(panel.url_path)
      ? afterSpacer
      : beforeSpacer
    ).push(panel);
  });

  beforeSpacer.sort(panelSorter);
  afterSpacer.sort(panelSorter);

  return [beforeSpacer, afterSpacer];
};

/*
 * @appliesMixin LocalizeMixin
 */
class OpSidebar extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;

  @property({ type: Boolean }) public alwaysExpand = false;
  @property({ type: Boolean, reflect: true }) public expanded = false;
  @property() public _defaultPage?: string =
    localStorage.defaultPage || DEFAULT_PANEL;
  @property() private _externalConfig?: ExternalConfig;
  @property() private _notifications?: PersistentNotification[];
  // property used only in css
  // @ts-ignore
  @property({ type: Boolean, reflect: true }) private _rtl = false;

  private _mouseLeaveTimeout?: number;
  private _tooltipHideTimeout?: number;
  private _recentKeydownActiveUntil = 0;

  protected render() {
    const opp = this.opp;

    if (!opp) {
      return html``;
    }

    const [beforeSpacer, afterSpacer] = computePanels(opp);

    let notificationCount = this._notifications
      ? this._notifications.length
      : 0;
    for (const entityId in opp.states) {
      if (computeDomain(entityId) === "configurator") {
        notificationCount++;
      }
    }

    return html`
      <div class="menu">
        ${!this.narrow
          ? html`
              <paper-icon-button
                aria-label=${opp.localize("ui.sidebar.sidebar_toggle")}
                .icon=${opp.dockedSidebar === "docked"
                  ? "opp:menu-open"
                  : "opp:menu"}
                @click=${this._toggleSidebar}
              ></paper-icon-button>
            `
          : ""}
        <span class="title">Open Peer Power</span>
      </div>
      <paper-listbox
        attr-for-selected="data-panel"
        .selected=${opp.panelUrl}
        @focusin=${this._listboxFocusIn}
        @focusout=${this._listboxFocusOut}
        @scroll=${this._listboxScroll}
        @keydown=${this._listboxKeydown}
      >
        ${this._renderPanel(
          this._defaultPage,
          "opp:apps",
          opp.localize("panel.states")
        )}
        ${beforeSpacer.map((panel) =>
          this._renderPanel(
            panel.url_path,
            panel.icon,
            opp.localize(`panel.${panel.title}`) || panel.title
          )
        )}
        <div class="spacer" disabled></div>

        ${afterSpacer.map((panel) =>
          this._renderPanel(
            panel.url_path,
            panel.icon,
            opp.localize(`panel.${panel.title}`) || panel.title
          )
        )}
        ${this._externalConfig && this._externalConfig.HasSettingsScreen
          ? html`
              <a
                aria-role="option"
                aria-label=${opp.localize(
                  "ui.sidebar.external_app_configuration"
                )}
                href="#external-app-configuration"
                tabindex="-1"
                @click=${this._handleExternalAppConfiguration}
                @mouseenter=${this._itemMouseEnter}
                @mouseleave=${this._itemMouseLeave}
              >
                <paper-icon-item>
                  <op-icon
                    slot="item-icon"
                    icon="opp:cellphone-settings-variant"
                  ></op-icon>
                  <span class="item-text">
                    ${opp.localize("ui.sidebar.external_app_configuration")}
                  </span>
                </paper-icon-item>
              </a>
            `
          : ""}
      </paper-listbox>

      <div class="divider"></div>

      <div
        class="notifications-container"
        @mouseenter=${this._itemMouseEnter}
        @mouseleave=${this._itemMouseLeave}
      >
        <paper-icon-item
          class="notifications"
          aria-role="option"
          @click=${this._handleShowNotificationDrawer}
        >
          <op-icon slot="item-icon" icon="opp:bell"></op-icon>
          ${!this.expanded && notificationCount > 0
            ? html`
                <span class="notification-badge" slot="item-icon">
                  ${notificationCount}
                </span>
              `
            : ""}
          <span class="item-text">
            ${opp.localize("ui.notification_drawer.title")}
          </span>
          ${this.expanded && notificationCount > 0
            ? html`
                <span class="notification-badge">${notificationCount}</span>
              `
            : ""}
        </paper-icon-item>
      </div>

      <a
        class=${classMap({
          profile: true,
          // Mimick behavior that paper-listbox provides
          "iron-selected": opp.panelUrl === "profile",
        })}
        href="/profile"
        data-panel="panel"
        tabindex="-1"
        aria-role="option"
        aria-label=${opp.localize("panel.profile")}
        @mouseenter=${this._itemMouseEnter}
        @mouseleave=${this._itemMouseLeave}
      >
        <paper-icon-item>
          <op-user-badge slot="item-icon" .user=${opp.user}></op-user-badge>

          <span class="item-text">
            ${opp.user ? opp.user.name : ""}
          </span>
        </paper-icon-item>
      </a>
      <div disabled class="bottom-spacer"></div>
      <div class="tooltip"></div>
    `;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (
      changedProps.has("expanded") ||
      changedProps.has("narrow") ||
      changedProps.has("alwaysExpand") ||
      changedProps.has("_externalConfig") ||
      changedProps.has("_notifications")
    ) {
      return true;
    }
    if (!this.opp || !changedProps.has("opp")) {
      return false;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower;
    if (!oldOpp) {
      return true;
    }
    const opp = this.opp;
    return (
      opp.panels !== oldOpp.panels ||
      opp.panelUrl !== oldOpp.panelUrl ||
      opp.user !== oldOpp.user ||
      opp.localize !== oldOpp.localize ||
      opp.states !== oldOpp.states
    );
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    if (this.opp && this.opp.auth.external) {
      getExternalConfig(this.opp.auth.external).then((conf) => {
        this._externalConfig = conf;
      });
    }
    subscribeNotifications(this.opp.connection, (notifications) => {
      this._notifications = notifications;
    });
  }

  protected updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("alwaysExpand")) {
      this.expanded = this.alwaysExpand;
    }
    if (!changedProps.has("opp")) {
      return;
    }

    this._rtl = computeRTL(this.opp);

    if (!SUPPORT_SCROLL_IF_NEEDED) {
      return;
    }
    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;
    if (!oldOpp || oldOpp.panelUrl !== this.opp.panelUrl) {
      const selectedEl = this.shadowRoot!.querySelector(".iron-selected");
      if (selectedEl) {
        // @ts-ignore
        selectedEl.scrollIntoViewIfNeeded();
      }
    }
  }

  private get _tooltip() {
    return this.shadowRoot!.querySelector(".tooltip")! as HTMLDivElement;
  }

  private _itemMouseEnter(ev: MouseEvent) {
    // On keypresses on the listbox, we're going to ignore mouse enter events
    // for 100ms so that we ignore it when pressing down arrow scrolls the
    // sidebar causing the mouse to hover a new icon
    if (
      this.expanded ||
      new Date().getTime() < this._recentKeydownActiveUntil
    ) {
      return;
    }
    if (this._mouseLeaveTimeout) {
      clearTimeout(this._mouseLeaveTimeout);
      this._mouseLeaveTimeout = undefined;
    }
    this._showTooltip(ev.currentTarget as PaperIconItemElement);
  }

  private _itemMouseLeave() {
    if (this._mouseLeaveTimeout) {
      clearTimeout(this._mouseLeaveTimeout);
    }
    this._mouseLeaveTimeout = window.setTimeout(() => {
      this._hideTooltip();
    }, 500);
  }

  private _listboxFocusIn(ev) {
    if (this.expanded || ev.target.nodeName !== "A") {
      return;
    }
    this._showTooltip(ev.target.querySelector("paper-icon-item"));
  }

  private _listboxFocusOut() {
    this._hideTooltip();
  }

  @eventOptions({
    passive: true,
  })
  private _listboxScroll() {
    // On keypresses on the listbox, we're going to ignore scroll events
    // for 100ms so that if pressing down arrow scrolls the sidebar, the tooltip
    // will not be hidden.
    if (new Date().getTime() < this._recentKeydownActiveUntil) {
      return;
    }
    this._hideTooltip();
  }

  private _listboxKeydown() {
    this._recentKeydownActiveUntil = new Date().getTime() + 100;
  }

  private _showTooltip(item: PaperIconItemElement) {
    if (this._tooltipHideTimeout) {
      clearTimeout(this._tooltipHideTimeout);
      this._tooltipHideTimeout = undefined;
    }
    const tooltip = this._tooltip;
    const listbox = this.shadowRoot!.querySelector("paper-listbox")!;
    let top = item.offsetTop + 11;
    if (listbox.contains(item)) {
      top -= listbox.scrollTop;
    }
    tooltip.innerHTML = item.querySelector(".item-text")!.innerHTML;
    tooltip.style.display = "block";
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${item.offsetLeft + item.clientWidth + 4}px`;
  }

  private _hideTooltip() {
    // Delay it a little in case other events are pending processing.
    if (!this._tooltipHideTimeout) {
      this._tooltipHideTimeout = window.setTimeout(() => {
        this._tooltipHideTimeout = undefined;
        this._tooltip.style.display = "none";
      }, 10);
    }
  }

  private _handleShowNotificationDrawer() {
    fireEvent(this, "opp-show-notifications");
  }

  private _handleExternalAppConfiguration(ev: Event) {
    ev.preventDefault();
    this.opp.auth.external!.fireMessage({
      type: "config_screen/show",
    });
  }

  private _toggleSidebar() {
    fireEvent(this, "opp-toggle-menu");
  }

  private _renderPanel(urlPath, icon, title) {
    return html`
      <a
        aria-role="option"
        href="${`/${urlPath}`}"
        data-panel="${urlPath}"
        tabindex="-1"
        @mouseenter=${this._itemMouseEnter}
        @mouseleave=${this._itemMouseLeave}
      >
        <paper-icon-item>
          <op-icon slot="item-icon" .icon="${icon}"></op-icon>
          <span class="item-text">${title}</span>
        </paper-icon-item>
      </a>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        height: 100%;
        display: block;
        overflow: hidden;
        -ms-user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        border-right: 1px solid var(--divider-color);
        background-color: var(--sidebar-background-color);
        width: 64px;
      }
      :host([expanded]) {
        width: 256px;
      }

      .menu {
        box-sizing: border-box;
        height: 65px;
        display: flex;
        padding: 0 12px;
        border-bottom: 1px solid transparent;
        white-space: nowrap;
        font-weight: 400;
        color: var(--primary-text-color);
        border-bottom: 1px solid var(--divider-color);
        background-color: var(--primary-background-color);
        font-size: 20px;
        align-items: center;
      }
      :host([expanded]) .menu {
        width: 256px;
      }

      .menu paper-icon-button {
        color: var(--sidebar-icon-color);
      }
      :host([expanded]) .menu paper-icon-button {
        margin-right: 23px;
      }
      :host([expanded][_rtl]) .menu paper-icon-button {
        margin-right: 0px;
        margin-left: 23px;
      }

      .title {
        display: none;
      }
      :host([expanded]) .title {
        display: initial;
      }

      paper-listbox::-webkit-scrollbar {
        width: 0.4rem;
        height: 0.4rem;
      }

      paper-listbox::-webkit-scrollbar-thumb {
        -webkit-border-radius: 4px;
        border-radius: 4px;
        background: var(--scrollbar-thumb-color);
      }

      paper-listbox {
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        height: calc(100% - 196px);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-color: var(--scrollbar-thumb-color) transparent;
        scrollbar-width: thin;
      }

      a {
        text-decoration: none;
        color: var(--sidebar-text-color);
        font-weight: 500;
        font-size: 14px;
        position: relative;
        display: block;
        outline: 0;
      }

      paper-icon-item {
        box-sizing: border-box;
        margin: 4px 8px;
        padding-left: 12px;
        border-radius: 4px;
        --paper-item-min-height: 40px;
        width: 48px;
      }
      :host([expanded]) paper-icon-item {
        width: 240px;
      }
      :host([_rtl]) paper-icon-item {
        padding-left: auto;
        padding-right: 12px;
      }

      op-icon[slot="item-icon"] {
        color: var(--sidebar-icon-color);
      }

      .iron-selected paper-icon-item::before,
      a:not(.iron-selected):focus::before {
        border-radius: 4px;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        content: "";
        transition: opacity 15ms linear;
        will-change: opacity;
      }
      .iron-selected paper-icon-item::before {
        background-color: var(--sidebar-selected-icon-color);
        opacity: 0.12;
      }
      a:not(.iron-selected):focus::before {
        background-color: currentColor;
        opacity: var(--dark-divider-opacity);
        margin: 4px 8px;
      }
      .iron-selected paper-icon-item:focus::before,
      .iron-selected:focus paper-icon-item::before {
        opacity: 0.2;
      }

      .iron-selected paper-icon-item[pressed]:before {
        opacity: 0.37;
      }

      paper-icon-item span {
        color: var(--sidebar-text-color);
        font-weight: 500;
        font-size: 14px;
      }

      a.iron-selected paper-icon-item op-icon {
        color: var(--sidebar-selected-icon-color);
      }

      a.iron-selected .item-text {
        color: var(--sidebar-selected-text-color);
      }

      paper-icon-item .item-text {
        display: none;
        max-width: calc(100% - 56px);
      }
      :host([expanded]) paper-icon-item .item-text {
        display: block;
      }

      .divider {
        bottom: 112px;
        padding: 10px 0;
      }
      .divider::before {
        content: " ";
        display: block;
        height: 1px;
        background-color: var(--divider-color);
      }
      .notifications-container {
        display: flex;
      }
      .notifications {
        cursor: pointer;
      }
      .notifications .item-text {
        flex: 1;
      }
      .profile {
      }
      .profile paper-icon-item {
        padding-left: 4px;
      }
      :host([_rtl]) .profile paper-icon-item {
        padding-left: auto;
        padding-right: 4px;
      }
      .profile .item-text {
        margin-left: 8px;
      }
      :host([_rtl]) .profile .item-text {
        margin-right: 8px;
      }

      .notification-badge {
        min-width: 20px;
        box-sizing: border-box;
        border-radius: 50%;
        font-weight: 400;
        background-color: var(--accent-color);
        line-height: 20px;
        text-align: center;
        padding: 0px 6px;
        color: var(--text-primary-color);
      }
      op-icon + .notification-badge {
        position: absolute;
        bottom: 14px;
        left: 26px;
        font-size: 0.65em;
      }

      .spacer {
        flex: 1;
        pointer-events: none;
      }

      .subheader {
        color: var(--sidebar-text-color);
        font-weight: 500;
        font-size: 14px;
        padding: 16px;
        white-space: nowrap;
      }

      .dev-tools {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0 8px;
        width: 256px;
        box-sizing: border-box;
      }

      .dev-tools a {
        color: var(--sidebar-icon-color);
      }

      .tooltip {
        display: none;
        position: absolute;
        opacity: 0.9;
        border-radius: 2px;
        white-space: nowrap;
        color: var(--sidebar-background-color);
        background-color: var(--sidebar-text-color);
        padding: 4px;
        font-weight: 500;
      }

      :host([_rtl]) .menu paper-icon-button {
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-sidebar": OpSidebar;
  }
}

customElements.define("op-sidebar", OpSidebar);
