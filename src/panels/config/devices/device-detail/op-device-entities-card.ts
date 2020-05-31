import {
  LitElement,
  TemplateResult,
  html,
  property,
  customElement,
  css,
  CSSResult,
  queryAll,
  PropertyValues,
} from "lit-element";

import { OpenPeerPower } from "../../../../types";

import "../../../../components/entity/state-badge";

import "@polymer/paper-item/paper-item";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";

import "../../../../components/op-card";
import "../../../../components/op-icon";
import { showEntityRegistryDetailDialog } from "../../entities/show-dialog-entity-registry-detail";
import { computeDomain } from "../../../../common/entity/compute_domain";
import { domainIcon } from "../../../../common/entity/domain_icon";
import { EntityRegistryStateEntry } from "../op-config-device-page";
import { addEntitiesToDevconView } from "../../../devcon/editor/add-entities-to-view";
import { createRowElement } from "../../../devcon/create-element/create-row-element";
import { DevconRow } from "../../../devcon/entity-rows/types";

@customElement("op-device-entities-card")
export class OpDeviceEntitiesCard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public deviceId!: string;
  @property() public entities!: EntityRegistryStateEntry[];
  @property() public narrow!: boolean;
  @property() private _showDisabled = false;
  @queryAll("#entities > *") private _entityRows?: DevconRow[];

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!changedProps.has("opp")) {
      return;
    }
    this._entityRows?.forEach((element) => {
      element.opp = this.opp;
    });
  }

  protected render(): TemplateResult {
    const disabledEntities: EntityRegistryStateEntry[] = [];
    return html`
      <op-card
        .header=${this.opp.localize(
          "ui.panel.config.devices.entities.entities"
        )}
      >
        ${this.entities.length
          ? html`
              <div id="entities">
                ${this.entities.map((entry: EntityRegistryStateEntry) => {
                  if (entry.disabled_by) {
                    disabledEntities.push(entry);
                    return "";
                  }
                  return this.opp.states[entry.entity_id]
                    ? this._renderEntity(entry)
                    : this._renderEntry(entry);
                })}
              </div>
              ${disabledEntities.length
                ? !this._showDisabled
                  ? html`
                      <button
                        class="show-more"
                        @click=${this._toggleShowDisabled}
                      >
                        +${disabledEntities.length} disabled entities
                      </button>
                    `
                  : html`
                      ${disabledEntities.map((entry) =>
                        this._renderEntry(entry)
                      )}
                      <button
                        class="show-more"
                        @click=${this._toggleShowDisabled}
                      >
                        Hide disabled
                      </button>
                    `
                : ""}
              <div class="card-actions">
                <mwc-button @click=${this._addToDevconView}>
                  ${this.opp.localize(
                    "ui.panel.config.devices.entities.add_entities_devcon"
                  )}
                </mwc-button>
              </div>
            `
          : html`
              <div class="config-entry-row">
                <paper-item-body two-line>
                  <div>
                    ${this.opp.localize(
                      "ui.panel.config.devices.entities.none"
                    )}
                  </div>
                </paper-item-body>
              </div>
            `}
      </op-card>
    `;
  }

  private _toggleShowDisabled() {
    this._showDisabled = !this._showDisabled;
  }

  private _renderEntity(entry: EntityRegistryStateEntry): TemplateResult {
    const element = createRowElement({ entity: entry.entity_id });
    if (this.opp) {
      element.opp = this.opp;
    }
    // @ts-ignore
    element.entry = entry;
    element.addEventListener("opp-more-info", (ev) => this._openEditEntry(ev));

    return html`
      <div>${element}</div>
    `;
  }

  private _renderEntry(entry: EntityRegistryStateEntry): TemplateResult {
    return html`
      <paper-icon-item .entry=${entry} @click=${this._openEditEntry}>
        <op-icon
          slot="item-icon"
          .icon=${domainIcon(computeDomain(entry.entity_id))}
        ></op-icon>
        <paper-item-body>
          <div class="name">
            ${entry.stateName || entry.entity_id}
          </div>
        </paper-item-body>
      </paper-icon-item>
    `;
  }

  private _openEditEntry(ev: Event): void {
    ev.stopPropagation();
    const entry = (ev.currentTarget! as any).entry;
    showEntityRegistryDetailDialog(this, {
      entry,
      entity_id: entry.entity_id,
    });
  }

  private _addToDevconView(): void {
    addEntitiesToDevconView(
      this,
      this.opp,
      this.entities.map((entity) => entity.entity_id)
    );
  }

  static get styles(): CSSResult {
    return css`
      op-icon {
        width: 40px;
      }
      .entity-id {
        color: var(--secondary-text-color);
      }
      .buttons {
        text-align: right;
        margin: 0 0 0 8px;
      }
      .disabled-entry {
        color: var(--secondary-text-color);
      }
      #entities > * {
        margin: 8px 16px 8px 8px;
      }
      paper-icon-item {
        min-height: 40px;
        padding: 0 8px;
        cursor: pointer;
      }
      .name {
        font-size: 14px;
      }
      button.show-more {
        color: var(--primary-color);
        text-align: left;
        cursor: pointer;
        background: none;
        border-width: initial;
        border-style: none;
        border-color: initial;
        border-image: initial;
        padding: 16px;
        font: inherit;
      }
      button.show-more:focus {
        outline: none;
        text-decoration: underline;
      }
    `;
  }
}
