import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-spinner/paper-spinner-lite";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";

import { OpenPeerPower, Route } from "../../../src/types";
import {
  OppioAddonDetails,
  fetchOppioAddonInfo,
} from "../../../src/data/oppio/addon";
import { oppioStyle } from "../resources/oppio-style";
import { haStyle } from "../../../src/resources/styles";

import "./oppio-addon-audio";
import "./oppio-addon-config";
import "./oppio-addon-info";
import "./oppio-addon-logs";
import "./oppio-addon-network";

@customElement("oppio-addon-view")
class OppioAddonView extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public route!: Route;
  @property() public addon?: OppioAddonDetails;

  protected render(): TemplateResult {
    if (!this.addon) {
      return html`
        <paper-spinner-lite active></paper-spinner-lite>
      `;
    }
    return html`
      <opp-subpage header="Opp.io: add-on details" oppio>
        <div class="content">
          <oppio-addon-info
            .opp=${this.opp}
            .addon=${this.addon}
          ></oppio-addon-info>

          ${this.addon && this.addon.version
            ? html`
                <oppio-addon-config
                  .opp=${this.opp}
                  .addon=${this.addon}
                ></oppio-addon-config>

                ${this.addon.audio
                  ? html`
                      <oppio-addon-audio
                        .opp=${this.opp}
                        .addon=${this.addon}
                      ></oppio-addon-audio>
                    `
                  : ""}
                ${this.addon.network
                  ? html`
                      <oppio-addon-network
                        .opp=${this.opp}
                        .addon=${this.addon}
                      ></oppio-addon-network>
                    `
                  : ""}

                <oppio-addon-logs
                  .opp=${this.opp}
                  .addon=${this.addon}
                ></oppio-addon-logs>
              `
            : ""}
        </div>
      </opp-subpage>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      oppioStyle,
      css`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
        }
        .content {
          padding: 24px 0 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        oppio-addon-info,
        oppio-addon-network,
        oppio-addon-audio,
        oppio-addon-config {
          margin-bottom: 24px;
          width: 600px;
        }
        oppio-addon-logs {
          max-width: calc(100% - 8px);
          min-width: 600px;
        }
        @media only screen and (max-width: 600px) {
          oppio-addon-info,
          oppio-addon-network,
          oppio-addon-audio,
          oppio-addon-config,
          oppio-addon-logs {
            max-width: 100%;
            min-width: 100%;
          }
        }
      `,
    ];
  }

  protected async firstUpdated(): Promise<void> {
    await this._routeDataChanged(this.route);
    this.addEventListener("opp-api-called", (ev) => this._apiCalled(ev));
  }

  private async _apiCalled(ev): Promise<void> {
    const path: string = ev.detail.path;

    if (!path) {
      return;
    }

    if (path === "uninstall") {
      history.back();
    } else {
      await this._routeDataChanged(this.route);
    }
  }

  private async _routeDataChanged(routeData: Route): Promise<void> {
    const addon = routeData.path.substr(1);
    try {
      const addoninfo = await fetchOppioAddonInfo(this.opp, addon);
      this.addon = addoninfo;
    } catch {
      this.addon = undefined;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-addon-view": OppioAddonView;
  }
}
