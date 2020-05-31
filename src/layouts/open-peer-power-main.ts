import {
  LitElement,
  html,
  TemplateResult,
  CSSResult,
  css,
  PropertyValues,
  property,
} from "lit-element";
import "@polymer/app-layout/app-drawer-layout/app-drawer-layout";
import "@polymer/app-layout/app-drawer/app-drawer";
// Not a duplicate, it's for typing
// tslint:disable-next-line
import { AppDrawerElement } from "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/iron-media-query/iron-media-query";

import "./partial-panel-resolver";
import { OpenPeerPower, Route } from "../types";
import { fireEvent } from "../common/dom/fire_event";
import { PolymerChangedEvent } from "../polymer-types";
// tslint:disable-next-line: no-duplicate-imports
import { AppDrawerLayoutElement } from "@polymer/app-layout/app-drawer-layout/app-drawer-layout";
import { showNotificationDrawer } from "../dialogs/notifications/show-notification-drawer";
import { toggleAttribute } from "../common/dom/toggle_attribute";

const NON_SWIPABLE_PANELS = ["kiosk", "map"];

declare global {
  // for fire event
  interface OPPDomEvents {
    "opp-toggle-menu": undefined;
    "opp-show-notifications": undefined;
  }
}

class OpenPeerPowerMain extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public route?: Route;
  @property({ type: Boolean }) private narrow?: boolean;

  protected render(): TemplateResult {
    const opp = this.opp;

    if (!opp) {
      return html``;
    }

    const sidebarNarrow = this._sidebarNarrow;

    const disableSwipe =
      !sidebarNarrow || NON_SWIPABLE_PANELS.indexOf(opp.panelUrl) !== -1;

    return html`
      <iron-media-query
        query="(max-width: 870px)"
        @query-matches-changed=${this._narrowChanged}
      ></iron-media-query>

      <app-drawer-layout
        fullbleed
        .forceNarrow=${sidebarNarrow}
        responsive-width="0"
      >
        <app-drawer
          id="drawer"
          align="start"
          slot="drawer"
          .disableSwipe=${disableSwipe}
          .swipeOpen=${!disableSwipe}
          .persistent=${!this.narrow &&
            this.opp.dockedSidebar !== "always_hidden"}
        >
          <op-sidebar
            .opp=${opp}
            .narrow=${sidebarNarrow}
            .alwaysExpand=${sidebarNarrow ||
              this.opp.dockedSidebar === "docked"}
          ></op-sidebar>
        </app-drawer>

        <partial-panel-resolver
          .narrow=${this.narrow}
          .opp=${opp}
          .route=${this.route}
        ></partial-panel-resolver>
      </app-drawer-layout>
    `;
  }

  protected firstUpdated() {
    import(/* webpackChunkName: "op-sidebar" */ "../components/op-sidebar");

    this.addEventListener("opp-toggle-menu", () => {
      if (this._sidebarNarrow) {
        if (this.drawer.opened) {
          this.drawer.close();
        } else {
          this.drawer.open();
        }
      } else {
        fireEvent(this, "opp-dock-sidebar", {
          dock: this.opp.dockedSidebar === "auto" ? "docked" : "auto",
        });
        setTimeout(() => this.appLayout.resetLayout());
      }
    });

    this.addEventListener("opp-show-notifications", () => {
      showNotificationDrawer(this, {
        narrow: this.narrow!,
      });
    });
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    toggleAttribute(
      this,
      "expanded",
      this.narrow || this.opp.dockedSidebar !== "auto"
    );

    if (changedProps.has("route") && this._sidebarNarrow) {
      this.drawer.close();
    }

    const oldOpp = changedProps.get("opp") as OpenPeerPower | undefined;

    // Make app-drawer adjust to a potential LTR/RTL change
    if (oldOpp && oldOpp.language !== this.opp!.language) {
      this.drawer._resetPosition();
    }
  }

  private _narrowChanged(ev: PolymerChangedEvent<boolean>) {
    this.narrow = ev.detail.value;
  }

  private get _sidebarNarrow() {
    return this.narrow || this.opp.dockedSidebar === "always_hidden";
  }

  private get drawer(): AppDrawerElement {
    return this.shadowRoot!.querySelector("app-drawer")!;
  }

  private get appLayout(): AppDrawerLayoutElement {
    return this.shadowRoot!.querySelector("app-drawer-layout")!;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        color: var(--primary-text-color);
        /* remove the grey tap highlights in iOS on the fullscreen touch targets */
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        --app-drawer-width: 64px;
      }
      :host([expanded]) {
        --app-drawer-width: 256px;
      }
      partial-panel-resolver,
      op-sidebar {
        /* allow a light tap highlight on the actual interface elements  */
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }
      partial-panel-resolver {
        height: 100%;
      }
    `;
  }
}

customElements.define("open-peer-power-main", OpenPeerPowerMain);
