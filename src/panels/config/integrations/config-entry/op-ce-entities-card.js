import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../../../components/op-card";
import "../../../../layouts/opp-subpage";

import { EventsMixin } from "../../../../mixins/events-mixin";
import LocalizeMixIn from "../../../../mixins/localize-mixin";
import "../../../../components/entity/state-badge";
import { computeEntityRegistryName } from "../../../../data/entity_registry";

/*
 * @appliesMixin LocalizeMixIn
 * @appliesMixin EventsMixin
 */
class OpCeEntitiesCard extends LocalizeMixIn(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        op-card {
          margin-top: 8px;
          padding-bottom: 8px;
        }
        paper-icon-item {
          cursor: pointer;
          padding-top: 4px;
          padding-bottom: 4px;
        }
      </style>
      <op-card header="[[heading]]">
        <template is="dom-repeat" items="[[entities]]" as="entity">
          <paper-icon-item on-click="_openMoreInfo">
            <state-badge
              state-obj="[[_computeStateObj(entity, opp)]]"
              slot="item-icon"
            ></state-badge>
            <paper-item-body>
              <div class="name">[[_computeEntityName(entity, opp)]]</div>
              <div class="secondary entity-id">[[entity.entity_id]]</div>
            </paper-item-body>
          </paper-icon-item>
        </template>
      </op-card>
    `;
  }

  static get properties() {
    return {
      heading: String,
      entities: Array,
      opp: Object,
    };
  }

  _computeStateObj(entity, opp) {
    return opp.states[entity.entity_id];
  }

  _computeEntityName(entity, opp) {
    return (
      computeEntityRegistryName(opp, entity) ||
      `(${this.localize(
        "ui.panel.config.integrations.config_entry.entity_unavailable"
      )})`
    );
  }

  _openMoreInfo(ev) {
    this.fire("opp-more-info", { entityId: ev.model.entity.entity_id });
  }
}

customElements.define("op-ce-entities-card", OpCeEntitiesCard);
