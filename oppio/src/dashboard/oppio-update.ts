import {
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  property,
  customElement,
} from "lit-element";
import "@polymer/iron-icon/iron-icon";

import { OpenPeerPower } from "../../../src/types";
import { OppioOppOSInfo } from "../../../src/data/oppio/host";
import {
  OppioOpenPeerPowerInfo,
  OppioSupervisorInfo,
} from "../../../src/data/oppio/supervisor";

import { oppioStyle } from "../resources/oppio-style";
import { haStyle } from "../../../src/resources/styles";

import "@material/mwc-button";
import "@polymer/paper-card/paper-card";
import "../../../src/components/buttons/op-call-api-button";
import "../components/oppio-card-content";

@customElement("oppio-update")
export class OppioUpdate extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public oppInfo: OppioOpenPeerPowerInfo;
  @property() public oppOsInfo?: OppioOppOSInfo;
  @property() public supervisorInfo: OppioSupervisorInfo;
  @property() private _error?: string;

  protected render(): TemplateResult {
    const updatesAvailable: number = [
      this.oppInfo,
      this.supervisorInfo,
      this.oppOsInfo,
    ].filter((value) => {
      return (
        !!value &&
        (value.last_version
          ? value.version !== value.last_version
          : value.version !== value.version_latest)
      );
    }).length;

    if (!updatesAvailable) {
      return html``;
    }

    return html`
      <div class="content">
        ${this._error
          ? html`
              <div class="error">Error: ${this._error}</div>
            `
          : ""}
        <h1>
          ${updatesAvailable > 1
            ? "Updates Available 🎉"
            : "Update Available 🎉"}
        </h1>
        <div class="card-group">
          ${this._renderUpdateCard(
            "Open Peer Power Core",
            this.oppInfo.version,
            this.oppInfo.last_version,
            "oppio/openpeerpower/update",
            `https://${
              this.oppInfo.last_version.includes("b") ? "rc" : "www"
            }.open-peer-power.io/latest-release-notes/`,
            "oppio:open-peer-power"
          )}
          ${this._renderUpdateCard(
            "Supervisor",
            this.supervisorInfo.version,
            this.supervisorInfo.last_version,
            "oppio/supervisor/update",
            `https://github.com//open-peer-power/oppio/releases/tag/${this.supervisorInfo.last_version}`
          )}
          ${this.oppOsInfo
            ? this._renderUpdateCard(
                "Operating System",
                this.oppOsInfo.version,
                this.oppOsInfo.version_latest,
                "oppio/oppos/update",
                `https://github.com//open-peer-power/oppos/releases/tag/${this.oppOsInfo.version_latest}`
              )
            : ""}
        </div>
      </div>
    `;
  }

  private _renderUpdateCard(
    name: string,
    curVersion: string,
    lastVersion: string,
    apiPath: string,
    releaseNotesUrl: string,
    icon?: string
  ): TemplateResult {
    if (lastVersion === curVersion) {
      return html``;
    }
    return html`
      <paper-card>
        <div class="card-content">
          ${icon
            ? html`
                <div class="icon">
                  <iron-icon .icon="${icon}" />
                </div>
              `
            : ""}
          <div class="update-heading">${name} ${lastVersion}</div>
          <div class="warning">
            You are currently running version ${curVersion}
          </div>
        </div>
        <div class="card-actions">
          <a href="${releaseNotesUrl}" target="_blank">
            <mwc-button>Release notes</mwc-button>
          </a>
          <op-call-api-button
            .opp=${this.opp}
            .path=${apiPath}
            @opp-api-called=${this._apiCalled}
          >
            Update
          </op-call-api-button>
        </div>
      </paper-card>
    `;
  }

  private _apiCalled(ev) {
    if (ev.detail.success) {
      this._error = "";
      return;
    }

    const response = ev.detail.response;

    typeof response.body === "object"
      ? (this._error = response.body.message || "Unknown error")
      : (this._error = response.body);
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      oppioStyle,
      css`
        .icon {
          --iron-icon-height: 48px;
          --iron-icon-width: 48px;
          float: right;
          margin: 0 0 2px 10px;
        }
        .update-heading {
          font-size: var(--paper-font-subhead_-_font-size);
          font-weight: 500;
          margin-bottom: 0.5em;
        }
        .warning {
          color: var(--secondary-text-color);
        }
        .card-content {
          height: calc(100% - 47px);
          box-sizing: border-box;
        }
        .card-actions {
          text-align: right;
        }
        .errors {
          color: var(--google-red-500);
          padding: 16px;
        }
        a {
          text-decoration: none;
        }
      `,
    ];
  }
}
