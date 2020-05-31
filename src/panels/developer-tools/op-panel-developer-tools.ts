import {
  LitElement,
  TemplateResult,
  html,
  CSSResultArray,
  css,
  customElement,
  property,
} from "lit-element";
import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-tabs/paper-tab";
import "@polymer/paper-tabs/paper-tabs";

import "../../components/op-menu-button";
import "./developer-tools-router";

import scrollToTarget from "../../common/dom/scroll-to-target";

import { opStyle } from "../../resources/styles";
import { OpenPeerPower, Route } from "../../types";
import { navigate } from "../../common/navigate";
import { isComponentLoaded } from "../../common/config/is_component_loaded";

@customElement("op-panel-developer-tools")
class PanelDeveloperTools extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public route!: Route;
  @property() public narrow!: boolean;

  protected render(): TemplateResult {
    const page = this._page;
    return html`
      <app-header-layout has-scrolling-region>
        <app-header fixed slot="header">
          <app-toolbar>
            <op-menu-button
              .opp=${this.opp}
              .narrow=${this.narrow}
            ></op-menu-button>
            <div main-title>${this.opp.localize("panel.developer_tools")}</div>
          </app-toolbar>
          <paper-tabs
            scrollable
            attr-for-selected="page-name"
            .selected=${page}
            @iron-activate=${this.handlePageSelected}
          >
            <paper-tab page-name="state">
              ${this.opp.localize("ui.panel.developer-tools.tabs.states.title")}
            </paper-tab>
            <paper-tab page-name="service">
              ${this.opp.localize(
                "ui.panel.developer-tools.tabs.services.title"
              )}
            </paper-tab>
            <paper-tab page-name="logs">
              ${this.opp.localize("ui.panel.developer-tools.tabs.logs.title")}
            </paper-tab>
            <paper-tab page-name="template">
              ${this.opp.localize(
                "ui.panel.developer-tools.tabs.templates.title"
              )}
            </paper-tab>
            <paper-tab page-name="event">
              ${this.opp.localize("ui.panel.developer-tools.tabs.events.title")}
            </paper-tab>
            ${isComponentLoaded(this.opp, "mqtt")
              ? html`
                  <paper-tab page-name="mqtt">
                    ${this.opp.localize(
                      "ui.panel.developer-tools.tabs.mqtt.title"
                    )}
                  </paper-tab>
                `
              : ""}
            <paper-tab page-name="info">
              ${this.opp.localize("ui.panel.developer-tools.tabs.info.title")}
            </paper-tab>
          </paper-tabs>
        </app-header>
        <developer-tools-router
          .route=${this.route}
          .narrow=${this.narrow}
          .opp=${this.opp}
        ></developer-tools-router>
      </app-header-layout>
    `;
  }

  private handlePageSelected(ev) {
    const newPage = ev.detail.item.getAttribute("page-name");
    if (newPage !== this._page) {
      navigate(this, `/developer-tools/${newPage}`);
    }

    scrollToTarget(
      this,
      // @ts-ignore
      this.shadowRoot!.querySelector("app-header-layout").header.scrollTarget
    );
  }

  private get _page() {
    return this.route.path.substr(1);
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
        }
        paper-tabs {
          margin-left: 12px;
          --paper-tabs-selection-bar-color: #fff;
          text-transform: uppercase;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-panel-developer-tools": PanelDeveloperTools;
  }
}
