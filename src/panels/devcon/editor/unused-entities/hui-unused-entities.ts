import {
  html,
  LitElement,
  TemplateResult,
  PropertyValues,
  property,
  customElement,
  css,
  CSSResult,
} from "lit-element";

import { classMap } from "lit-html/directives/class-map";

import memoizeOne from "memoize-one";

import "../../../../components/op-fab";
import "../../../../components/entity/state-badge";
import "../../../../components/op-relative-time";
import "../../../../components/op-icon";

import "../../../../components/data-table/op-data-table";
// tslint:disable-next-line
import {
  SelectionChangedEvent,
  DataTableColumnContainer,
} from "../../../../components/data-table/op-data-table";

import { computeStateName } from "../../../../common/entity/compute_state_name";
import { computeDomain } from "../../../../common/entity/compute_domain";

import { computeRTL } from "../../../../common/util/compute_rtl";
import { computeUnusedEntities } from "../../common/compute-unused-entities";

import { OpenPeerPower } from "../../../../types";
import { Devcon } from "../../types";
import { DevconConfig } from "../../../../data/devcon";
import { fireEvent } from "../../../../common/dom/fire_event";
import { addEntitiesToDevconView } from "../add-entities-to-view";

@customElement("hui-unused-entities")
export class HuiUnusedEntities extends LitElement {
  @property() public devcon?: Devcon;

  @property() public opp!: OpenPeerPower;

  @property() public narrow?: boolean;

  @property() private _unusedEntities: string[] = [];

  private _selectedEntities: string[] = [];

  private get _config(): DevconConfig {
    return this.devcon!.config;
  }

  private _columns = memoizeOne((narrow: boolean) => {
    const columns: DataTableColumnContainer = {
      entity: {
        title: this.opp!.localize("ui.panel.devcon.unused_entities.entity"),
        sortable: true,
        filterable: true,
        filterKey: "friendly_name",
        direction: "asc",
        template: (stateObj) => html`
          <div @click=${this._handleEntityClicked} style="cursor: pointer;">
            <state-badge .opp=${this.opp!} .stateObj=${stateObj}></state-badge>
            ${stateObj.friendly_name}
          </div>
        `,
      },
    };

    if (narrow) {
      return columns;
    }

    columns.entity_id = {
      title: this.opp!.localize("ui.panel.devcon.unused_entities.entity_id"),
      sortable: true,
      filterable: true,
    };
    columns.domain = {
      title: this.opp!.localize("ui.panel.devcon.unused_entities.domain"),
      sortable: true,
      filterable: true,
    };
    columns.last_changed = {
      title: this.opp!.localize("ui.panel.devcon.unused_entities.last_changed"),
      type: "numeric",
      sortable: true,
      template: (lastChanged: string) => html`
        <op-relative-time
          .opp=${this.opp!}
          .datetime=${lastChanged}
        ></op-relative-time>
      `,
    };

    return columns;
  });

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has("devcon")) {
      this._getUnusedEntities();
    }
  }

  protected render(): TemplateResult {
    if (!this.opp || !this.devcon) {
      return html``;
    }

    if (this.devcon.mode === "storage" && this.devcon.editMode === false) {
      return html``;
    }

    return html`
      <op-card
        header="${this.opp.localize("ui.panel.devcon.unused_entities.title")}"
      >
        <div class="card-content">
          ${this.opp.localize(
            "ui.panel.devcon.unused_entities.available_entities"
          )}
          ${this.devcon.mode === "storage"
            ? html`
                <br />${this.opp.localize(
                  "ui.panel.devcon.unused_entities.select_to_add"
                )}
              `
            : ""}
        </div>
      </op-card>
      <op-data-table
        .columns=${this._columns(this.narrow!)}
        .data=${this._unusedEntities.map((entity) => {
          const stateObj = this.opp!.states[entity];
          return {
            entity_id: entity,
            entity: {
              ...stateObj,
              friendly_name: computeStateName(stateObj),
            },
            domain: computeDomain(entity),
            last_changed: stateObj!.last_changed,
          };
        })}
        .id=${"entity_id"}
        selectable
        @selection-changed=${this._handleSelectionChanged}
      ></op-data-table>

      <op-fab
        class="${classMap({
          rtl: computeRTL(this.opp),
        })}"
        icon="opp:plus"
        label="${this.opp.localize("ui.panel.devcon.editor.edit_card.add")}"
        @click="${this._addToDevconView}"
      ></op-fab>
    `;
  }

  private _getUnusedEntities(): void {
    if (!this.opp || !this.devcon) {
      return;
    }
    this._selectedEntities = [];
    this._unusedEntities = computeUnusedEntities(this.opp, this._config!);
  }

  private _handleSelectionChanged(ev: CustomEvent): void {
    const changedSelection = ev.detail as SelectionChangedEvent;
    const entity = changedSelection.id;
    if (changedSelection.selected) {
      this._selectedEntities.push(entity);
    } else {
      const index = this._selectedEntities.indexOf(entity);
      if (index !== -1) {
        this._selectedEntities.splice(index, 1);
      }
    }
  }

  private _handleEntityClicked(ev: Event) {
    const entityId = (ev.target as HTMLElement)
      .closest("tr")!
      .getAttribute("data-row-id")!;
    fireEvent(this, "opp-more-info", {
      entityId,
    });
  }

  private _addToDevconView(): void {
    addEntitiesToDevconView(
      this,
      this.opp,
      this._selectedEntities,
      this.devcon!.config,
      this.devcon!.saveConfig
    );
  }

  static get styles(): CSSResult {
    return css`
      :host {
        background: var(--devcon-background);
        padding: 16px;
      }
      op-fab {
        position: sticky;
        float: right;
        bottom: 16px;
        z-index: 1;
      }
      op-fab.rtl {
        float: left;
      }
      op-card {
        margin-bottom: 16px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-unused-entities": HuiUnusedEntities;
  }
}
