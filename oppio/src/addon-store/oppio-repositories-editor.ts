import {
  LitElement,
  html,
  CSSResultArray,
  css,
  property,
  TemplateResult,
  customElement,
  PropertyValues,
} from "lit-element";
import "@polymer/iron-icon/iron-icon";
import "@polymer/paper-card/paper-card";
import "@polymer/paper-input/paper-input";
import memoizeOne from "memoize-one";

import "../../../src/components/buttons/op-call-api-button";
import "../components/oppio-card-content";
import { oppioStyle } from "../resources/oppio-style";
import { OpenPeerPower } from "../../../src/types";
import { OppioAddonRepository } from "../../../src/data/oppio/addon";
import { PolymerChangedEvent } from "../../../src/polymer-types";
import { repeat } from "lit-html/directives/repeat";

@customElement("oppio-repositories-editor")
class OppioRepositoriesEditor extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public repos!: OppioAddonRepository[];
  @property() private _repoUrl = "";

  private _sortedRepos = memoizeOne((repos: OppioAddonRepository[]) =>
    repos
      .filter((repo) => repo.slug !== "core" && repo.slug !== "local")
      .sort((a, b) => (a.name < b.name ? -1 : 1))
  );

  protected render(): TemplateResult {
    const repos = this._sortedRepos(this.repos);
    return html`
      <div class="content">
        <h1>
          Repositories
        </h1>
        <p class="description">
          Configure which add-on repositories to fetch data from:
        </p>
        <div class="card-group">
          ${// Use repeat so that the fade-out from call-service-api-button
          // stays with the correct repo after we add/delete one.
          repeat(
            repos,
            (repo) => repo.slug,
            (repo) => html`
              <paper-card>
                <div class="card-content">
                  <oppio-card-content
                    .opp=${this.opp}
                    .title=${repo.name}
                    .description=${repo.url}
                    icon="oppio:github-circle"
                  ></oppio-card-content>
                </div>
                <div class="card-actions">
                  <op-call-api-button
                    path="oppio/supervisor/options"
                    .opp=${this.opp}
                    .data=${this.computeRemoveRepoData(repos, repo.url)}
                    class="warning"
                  >
                    Remove
                  </op-call-api-button>
                </div>
              </paper-card>
            `
          )}

          <paper-card>
            <div class="card-content add">
              <iron-icon icon="oppio:github-circle"></iron-icon>
              <paper-input
                label="Add new repository by URL"
                .value=${this._repoUrl}
                @value-changed=${this._urlChanged}
              ></paper-input>
            </div>
            <div class="card-actions">
              <op-call-api-button
                path="oppio/supervisor/options"
                .opp=${this.opp}
                .data=${this.computeAddRepoData(repos, this._repoUrl)}
              >
                Add
              </op-call-api-button>
            </div>
          </paper-card>
        </div>
      </div>
    `;
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (changedProps.has("repos")) {
      this._repoUrl = "";
    }
  }

  private _urlChanged(ev: PolymerChangedEvent<string>) {
    this._repoUrl = ev.detail.value;
  }

  private computeRemoveRepoData(repoList, url) {
    const list = repoList
      .filter((repo) => repo.url !== url)
      .map((repo) => repo.source);
    return { addons_repositories: list };
  }

  private computeAddRepoData(repoList, url) {
    const list = repoList ? repoList.map((repo) => repo.source) : [];
    list.push(url);
    return { addons_repositories: list };
  }

  static get styles(): CSSResultArray {
    return [
      oppioStyle,
      css`
        .add {
          padding: 12px 16px;
        }
        iron-icon {
          color: var(--secondary-text-color);
          margin-right: 16px;
          display: inline-block;
        }
        paper-input {
          width: calc(100% - 49px);
          display: inline-block;
          margin-top: -4px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-repositories-editor": OppioRepositoriesEditor;
  }
}
