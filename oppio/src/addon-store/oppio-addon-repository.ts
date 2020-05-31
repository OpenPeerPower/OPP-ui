import {
  css,
  TemplateResult,
  html,
  LitElement,
  property,
  CSSResultArray,
} from "lit-element";
import "@polymer/paper-card/paper-card";
import memoizeOne from "memoize-one";

import "../components/oppio-card-content";
import { oppioStyle } from "../resources/oppio-style";
import { OpenPeerPower } from "../../../src/types";
import {
  OppioAddonInfo,
  OppioAddonRepository,
} from "../../../src/data/oppio/addon";
import { navigate } from "../../../src/common/navigate";
import { filterAndSort } from "../components/oppio-filter-addons";

class OppioAddonRepositoryEl extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public repo!: OppioAddonRepository;
  @property() public addons!: OppioAddonInfo[];
  @property() public filter!: string;

  private _getAddons = memoizeOne(
    (addons: OppioAddonInfo[], filter?: string) => {
      if (filter) {
        return filterAndSort(addons, filter);
      }
      return addons.sort((a, b) =>
        a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1
      );
    }
  );

  protected render(): TemplateResult {
    const repo = this.repo;
    const addons = this._getAddons(this.addons, this.filter);
    const ha105pluss = this._computeHA105plus;

    if (this.filter && addons.length < 1) {
      return html`
        <div class="content">
          <p class="description">
            No results found in "${repo.name}"
          </p>
        </div>
      `;
    }
    return html`
      <div class="content">
        <h1>
          ${repo.name}
        </h1>
        <p class="description">
          Maintained by ${repo.maintainer}<br />
          <a class="repo" href=${repo.url} target="_blank">${repo.url}</a>
        </p>
        <div class="card-group">
          ${addons.map(
            (addon) => html`
              <paper-card
                .addon=${addon}
                class=${addon.available ? "" : "not_available"}
                @click=${this._addonTapped}
              >
                <div class="card-content">
                  <oppio-card-content
                    .opp=${this.opp}
                    .title=${addon.name}
                    .description=${addon.description}
                    .available=${addon.available}
                    .icon=${addon.installed && addon.installed !== addon.version
                      ? "oppio:arrow-up-bold-circle"
                      : "oppio:puzzle"}
                    .iconTitle=${addon.installed
                      ? addon.installed !== addon.version
                        ? "New version available"
                        : "Add-on is installed"
                      : addon.available
                      ? "Add-on is not installed"
                      : "Add-on is not available on your system"}
                    .iconClass=${addon.installed
                      ? addon.installed !== addon.version
                        ? "update"
                        : "installed"
                      : !addon.available
                      ? "not_available"
                      : ""}
                    .iconImage=${ha105pluss && addon.icon
                      ? `/api/oppio/addons/${addon.slug}/icon`
                      : undefined}
                    .showTopbar=${addon.installed || !addon.available}
                    .topbarClass=${addon.installed
                      ? addon.installed !== addon.version
                        ? "update"
                        : "installed"
                      : !addon.available
                      ? "unavailable"
                      : ""}
                  ></oppio-card-content>
                </div>
              </paper-card>
            `
          )}
        </div>
      </div>
    `;
  }

  private _addonTapped(ev) {
    navigate(this, `/oppio/addon/${ev.currentTarget.addon.slug}`);
  }

  private get _computeHA105plus(): boolean {
    const [major, minor] = this.opp.config.version.split(".", 2);
    return Number(major) > 0 || (major === "0" && Number(minor) >= 105);
  }

  static get styles(): CSSResultArray {
    return [
      oppioStyle,
      css`
        paper-card {
          cursor: pointer;
        }
        .not_available {
          opacity: 0.6;
        }
        a.repo {
          color: var(--primary-text-color);
        }
      `,
    ];
  }
}

customElements.define("oppio-addon-repository", OppioAddonRepositoryEl);
