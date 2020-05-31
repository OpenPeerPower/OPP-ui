import "@polymer/paper-card/paper-card";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";

import { OpenPeerPower } from "../../../src/types";
import { OppioAddonInfo } from "../../../src/data/oppio/addon";
import { navigate } from "../../../src/common/navigate";
import { oppioStyle } from "../resources/oppio-style";
import { haStyle } from "../../../src/resources/styles";
import "../components/oppio-card-content";

@customElement("oppio-addons")
class OppioAddons extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public addons?: OppioAddonInfo[];

  protected render(): TemplateResult {
    const [major, minor] = this.opp.config.version.split(".", 2);
    const ha105pluss =
      Number(major) > 0 || (major === "0" && Number(minor) >= 105);
    return html`
      <div class="content">
        <h1>Add-ons</h1>
        <div class="card-group">
          ${!this.addons
            ? html`
                <paper-card>
                  <div class="card-content">
                    You don't have any add-ons installed yet. Head over to
                    <a href="#" @click=${this._openStore}>the add-on store</a>
                    to get started!
                  </div>
                </paper-card>
              `
            : this.addons
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .map(
                  (addon) => html`
                    <paper-card .addon=${addon} @click=${this._addonTapped}>
                      <div class="card-content">
                        <oppio-card-content
                          .opp=${this.opp}
                          .title=${addon.name}
                          .description=${addon.description}
                          available
                          .showTopbar=${addon.installed !== addon.version}
                          topbarClass="update"
                          .icon=${addon.installed !== addon.version
                            ? "oppio:arrow-up-bold-circle"
                            : "oppio:puzzle"}
                          .iconTitle=${addon.state !== "started"
                            ? "Add-on is stopped"
                            : addon.installed !== addon.version
                            ? "New version available"
                            : "Add-on is running"}
                          .iconClass=${addon.installed &&
                          addon.installed !== addon.version
                            ? addon.state === "started"
                              ? "update"
                              : "update stopped"
                            : addon.installed && addon.state === "started"
                            ? "running"
                            : "stopped"}
                          .iconImage=${ha105pluss && addon.icon
                            ? `/api/oppio/addons/${addon.slug}/icon`
                            : undefined}
                        ></oppio-card-content>
                      </div>
                    </paper-card>
                  `
                )}
        </div>
      </div>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      oppioStyle,
      css`
        paper-card {
          cursor: pointer;
        }
      `,
    ];
  }

  private _addonTapped(ev: any): void {
    navigate(this, `/oppio/addon/${ev.currentTarget.addon.slug}`);
  }

  private _openStore(): void {
    navigate(this, "/oppio/store");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-addons": OppioAddons;
  }
}
