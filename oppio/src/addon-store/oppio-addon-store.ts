import "./oppio-addon-repository";
import "./oppio-repositories-editor";
import { TemplateResult, html } from "lit-html";
import {
  LitElement,
  CSSResult,
  css,
  property,
  PropertyValues,
} from "lit-element";
import { OpenPeerPower } from "../../../src/types";
import {
  OppioAddonRepository,
  OppioAddonInfo,
  fetchOppioAddonsInfo,
  reloadOppioAddons,
} from "../../../src/data/oppio/addon";
import "../../../src/layouts/loading-screen";
import "../components/oppio-search-input";

const sortRepos = (a: OppioAddonRepository, b: OppioAddonRepository) => {
  if (a.slug === "local") {
    return -1;
  }
  if (b.slug === "local") {
    return 1;
  }
  if (a.slug === "core") {
    return -1;
  }
  if (b.slug === "core") {
    return 1;
  }
  return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
};

class OppioAddonStore extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() private _addons?: OppioAddonInfo[];
  @property() private _repos?: OppioAddonRepository[];
  @property() private _filter?: string;

  public async refreshData() {
    this._repos = undefined;
    this._addons = undefined;
    this._filter = undefined;
    await reloadOppioAddons(this.opp);
    await this._loadData();
  }

  protected render(): TemplateResult {
    if (!this._addons || !this._repos) {
      return html`
        <loading-screen></loading-screen>
      `;
    }
    const repos: TemplateResult[] = [];

    for (const repo of this._repos) {
      const addons = this._addons!.filter(
        (addon) => addon.repository === repo.slug
      );

      if (addons.length === 0) {
        continue;
      }

      repos.push(html`
        <oppio-addon-repository
          .opp=${this.opp}
          .repo=${repo}
          .addons=${addons}
          .filter=${this._filter}
        ></oppio-addon-repository>
      `);
    }

    return html`
      <oppio-repositories-editor
        .opp=${this.opp}
        .repos=${this._repos}
      ></oppio-repositories-editor>

      <oppio-search-input
        .filter=${this._filter}
        @value-changed=${this._filterChanged}
      ></oppio-search-input>

      ${repos}
    `;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this.addEventListener("opp-api-called", (ev) => this.apiCalled(ev));
    this._loadData();
  }

  private apiCalled(ev) {
    if (ev.detail.success) {
      this._loadData();
    }
  }

  private async _loadData() {
    try {
      const addonsInfo = await fetchOppioAddonsInfo(this.opp);
      this._repos = addonsInfo.repositories;
      this._repos.sort(sortRepos);
      this._addons = addonsInfo.addons;
    } catch (err) {
      alert("Failed to fetch add-on info");
    }
  }

  private async _filterChanged(e) {
    this._filter = e.detail.value;
  }

  static get styles(): CSSResult {
    return css`
      oppio-addon-repository {
        margin-top: 24px;
      }
    `;
  }
}

customElements.define("oppio-addon-store", OppioAddonStore);
