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

import "../../../components/op-menu-button";

import { opStyle } from "../../../resources/styles";
import { OpenPeerPower } from "../../../types";
import { CloudStatus } from "../../../data/cloud";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";

import "../../../components/op-card";
import "../../../components/op-icon-next";

import "../op-config-section";
import "./op-config-navigation";
import { configSections } from "../op-panel-config";

@customElement("op-config-dashboard")
class OpConfigDashboard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() public cloudStatus?: CloudStatus;
  @property() public showAdvanced!: boolean;

  protected render(): TemplateResult {
    return html`
      <app-header-layout has-scrolling-region>
        <app-header fixed slot="header">
          <app-toolbar>
            <op-menu-button
              .opp=${this.opp}
              .narrow=${this.narrow}
            ></op-menu-button>
          </app-toolbar>
        </app-header>

        <op-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">
            ${this.opp.localize("ui.panel.config.header")}
          </div>

          <div slot="introduction">
            ${this.opp.localize("ui.panel.config.introduction")}
          </div>

          ${this.cloudStatus && isComponentLoaded(this.opp, "cloud")
            ? html`
                <op-card>
                  <op-config-navigation
                    .opp=${this.opp}
                    .showAdvanced=${this.showAdvanced}
                    .pages=${[
                      {
                        component: "cloud",
                        path: "/config/cloud",
                        translationKey: "ui.panel.config.cloud.caption",
                        info: this.cloudStatus,
                        icon: "opp:cloud-lock",
                      },
                    ]}
                  ></op-config-navigation>
                </op-card>
              `
            : ""}
          ${Object.values(configSections).map(
            (section) => html`
              <op-card>
                <op-config-navigation
                  .opp=${this.opp}
                  .showAdvanced=${this.showAdvanced}
                  .pages=${section}
                ></op-config-navigation>
              </op-card>
            `
          )}
          ${!this.showAdvanced
            ? html`
                <div class="promo-advanced">
                  ${this.opp.localize(
                    "ui.panel.config.advanced_mode.hint_enable"
                  )}
                  <a href="/profile"
                    >${this.opp.localize(
                      "ui.panel.config.advanced_mode.link_profile_page"
                    )}</a
                  >.
                </div>
              `
            : ""}
        </op-config-section>
      </app-header-layout>
    `;
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        app-header {
          --app-header-background-color: var(--primary-background-color);
        }
        op-card:last-child {
          margin-bottom: 24px;
        }
        op-config-section {
          margin-top: -20px;
        }
        op-card {
          overflow: hidden;
        }
        op-card a {
          text-decoration: none;
          color: var(--primary-text-color);
        }
        .promo-advanced {
          text-align: center;
          color: var(--secondary-text-color);
          margin-bottom: 24px;
        }
        .promo-advanced a {
          color: var(--secondary-text-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-config-dashboard": OpConfigDashboard;
  }
}
