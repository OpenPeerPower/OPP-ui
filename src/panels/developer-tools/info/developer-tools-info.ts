import {
  LitElement,
  html,
  CSSResult,
  css,
  TemplateResult,
  property,
} from "lit-element";

import { OpenPeerPower } from "../../../types";
import { opStyle } from "../../../resources/styles";

import "./system-health-card";
import "./integrations-card";

const JS_TYPE = __BUILD__;
const JS_VERSION = __VERSION__;
const OPT_IN_PANEL = "states";

class OpPanelDevInfo extends LitElement {
  @property() public opp!: OpenPeerPower;

  protected render(): TemplateResult {
    const opp = this.opp;
    const customUiList: Array<{ name: string; url: string; version: string }> =
      (window as any).CUSTOM_UI_LIST || [];

    return html`
      <div class="about">
        <p class="version">
          <a href="https://www.open-peer-power.io" target="_blank"
            ><img
              src="/static/icons/favicon-192x192.png"
              height="192"
              alt="${this.opp.localize(
                "ui.panel.developer-tools.tabs.info.open_peer_power_logo"
              )}"
          /></a>
          <br />
          <h2>Open Peer Power ${opp.config.version}</h2>
        </p>
        <p>
          ${this.opp.localize(
            "ui.panel.developer-tools.tabs.info.path_configuration",
            "path",
            opp.config.config_dir
          )}
        </p>
        <p class="develop">
          <a
            href="https://www.open-peer-power.io/developers/credits/"
            target="_blank"
          >
            ${this.opp.localize(
              "ui.panel.developer-tools.tabs.info.developed_by"
            )}
          </a>
        </p>
        <p>
          ${this.opp.localize(
            "ui.panel.developer-tools.tabs.info.license"
          )}<br />
          ${this.opp.localize("ui.panel.developer-tools.tabs.info.source")}
          <a
            href="https://github.com/open-peer-power/open-peer-power"
            target="_blank"
            >${this.opp.localize(
              "ui.panel.developer-tools.tabs.info.server"
            )}</a
          >
          &mdash;
          <a
            href="https://github.com/open-peer-power/open-peer-power-polymer"
            target="_blank"
            >${this.opp.localize(
              "ui.panel.developer-tools.tabs.info.frontend"
            )}</a
          >
        </p>
        <p>
          ${this.opp.localize("ui.panel.developer-tools.tabs.info.built_using")}
          <a href="https://www.python.org">Python 3</a>,
          <a href="https://www.polymer-project.org" target="_blank">Polymer</a>,
          ${this.opp.localize("ui.panel.developer-tools.tabs.info.icons_by")}
          <a href="https://www.google.com/design/icons/" target="_blank"
            >Google</a
          >
          and
          <a href="https://MaterialDesignIcons.com" target="_blank"
            >MaterialDesignIcons.com</a
          >.
        </p>
        <p>
          ${this.opp.localize(
            "ui.panel.developer-tools.tabs.info.frontend_version",
            "version",
            JS_VERSION,
            "type",
            JS_TYPE
          )}
          ${
            customUiList.length > 0
              ? html`
                  <div>
                    ${this.opp.localize(
                      "ui.panel.developer-tools.tabs.info.custom_uis"
                    )}
                    ${customUiList.map(
                      (item) => html`
                        <div>
                          <a href="${item.url}" target="_blank"> ${item.name}</a
                          >: ${item.version}
                        </div>
                      `
                    )}
                  </div>
                `
              : ""
          }
        </p>
      </div>
      <div class="content">
        <system-health-card .opp=${this.opp}></system-health-card>
        <integrations-card .opp=${this.opp}></integrations-card>
      </div>
    `;
  }

  protected firstUpdated(changedProps): void {
    super.firstUpdated(changedProps);

    // Legacy custom UI can be slow to register, give them time.
    const customUI = ((window as any).CUSTOM_UI_LIST || []).length;
    setTimeout(() => {
      if (((window as any).CUSTOM_UI_LIST || []).length !== customUI.length) {
        this.requestUpdate();
      }
    }, 1000);
  }

  protected _toggleDefaultPage(): void {
    if (localStorage.defaultPage === OPT_IN_PANEL) {
      delete localStorage.defaultPage;
    } else {
      localStorage.defaultPage = OPT_IN_PANEL;
    }
    this.requestUpdate();
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        :host {
          -ms-user-select: initial;
          -webkit-user-select: initial;
          -moz-user-select: initial;
        }

        .content {
          direction: ltr;
        }

        .about {
          text-align: center;
          line-height: 2em;
        }

        .version {
          @apply --paper-font-headline;
        }

        .develop {
          @apply --paper-font-subhead;
        }

        .about a {
          color: var(--dark-primary-color);
        }

        system-health-card,
        integrations-card {
          display: block;
          max-width: 600px;
          margin: 0 auto;
          padding-bottom: 16px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "developer-tools-info": OpPanelDevInfo;
  }
}

customElements.define("developer-tools-info", OpPanelDevInfo);
