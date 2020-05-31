import "@polymer/iron-icon/iron-icon";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-item/paper-icon-item";

import { isComponentLoaded } from "../../../common/config/is_component_loaded";

import "../../../components/op-card";
import "../../../components/op-icon-next";
import {
  LitElement,
  html,
  TemplateResult,
  property,
  customElement,
  CSSResult,
  css,
} from "lit-element";
import { OpenPeerPower } from "../../../types";
import { CloudStatus, CloudStatusLoggedIn } from "../../../data/cloud";
import { PageNavigation } from "../../../layouts/opp-tabs-subpage";

@customElement("op-config-navigation")
class OpConfigNavigation extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public showAdvanced!: boolean;
  @property() public pages!: PageNavigation[];

  protected render(): TemplateResult {
    return html`
      ${this.pages.map((page) =>
        (!page.component ||
          page.core ||
          isComponentLoaded(this.opp, page.component)) &&
        (!page.exportOnly || this.showAdvanced)
          ? html`
              <a
                href=${`/config/${page.component}`}
                aria-role="option"
                tabindex="-1"
              >
                <paper-icon-item>
                  <op-icon .icon=${page.icon} slot="item-icon"></op-icon>
                  <paper-item-body two-line>
                    ${this.opp.localize(
                      `ui.panel.config.${page.component}.caption`
                    )}
                    ${page.component === "cloud" && (page.info as CloudStatus)
                      ? page.info.logged_in
                        ? html`
                            <div secondary>
                              ${this.opp.localize(
                                "ui.panel.config.cloud.description_login",
                                "email",
                                (page.info as CloudStatusLoggedIn).email
                              )}
                            </div>
                          `
                        : html`
                            <div secondary>
                              ${this.opp.localize(
                                "ui.panel.config.cloud.description_features"
                              )}
                            </div>
                          `
                      : html`
                          <div secondary>
                            ${this.opp.localize(
                              `ui.panel.config.${page.component}.description`
                            )}
                          </div>
                        `}
                  </paper-item-body>
                  <op-icon-next></op-icon-next>
                </paper-icon-item>
              </a>
            `
          : ""
      )}
    `;
  }

  static get styles(): CSSResult {
    return css`
      a {
        text-decoration: none;
        color: var(--primary-text-color);
        position: relative;
        display: block;
        outline: 0;
      }
      op-icon,
      op-icon-next {
        color: var(--secondary-text-color);
      }
      .iron-selected paper-item::before,
      a:not(.iron-selected):focus::before {
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
      a:not(.iron-selected):focus::before {
        background-color: currentColor;
        opacity: var(--dark-divider-opacity);
      }
      .iron-selected paper-item:focus::before,
      .iron-selected:focus paper-item::before {
        opacity: 0.2;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-config-navigation": OpConfigNavigation;
  }
}
