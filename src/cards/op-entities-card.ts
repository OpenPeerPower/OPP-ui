import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../components/entity/op-entity-toggle";
import "../components/op-card";

import computeStateDomain from "../common/entity/compute_state_domain";
import computeStateName from "../common/entity/compute_state_name";
import stateMoreInfoType from "../common/entity/state_more_info_type";
import canToggleState from "../common/entity/can_toggle_state";
import { EventsMixin } from "../mixins/events-mixin";

class OpEntitiesCard extends EventsMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="iron-flex"></style>
      <style>
        op-card {
          padding: 16px;
        }
        .states {
          margin: -4px 0;
        }
        .state {
          padding: 4px 0;
        }
        .header {
          @apply --paper-font-headline;
          /* overwriting line-height +8 because entity-toggle can be 40px height,
           compensating this with reduced padding */
          line-height: 40px;
          color: var(--primary-text-color);
          padding: 4px 0 12px;
        }
        .header .name {
          @apply --paper-font-common-nowrap;
        }
        op-entity-toggle {
          margin-left: 16px;
        }
        .more-info {
          cursor: pointer;
        }
      </style>

      <op-card>
        <template is="dom-if" if="[[title]]">
          <div
            class$="[[computeTitleClass(groupEntity)]]"
            on-click="entityTapped"
          >
            <div class="flex name">[[title]]</div>
            <template is="dom-if" if="[[showGroupToggle(groupEntity, states)]]">
              <op-entity-toggle
                opp="[[opp]]"
                state-obj="[[groupEntity]]"
              ></op-entity-toggle>
            </template>
          </div>
        </template>
        <div class="states">
          <template
            is="dom-repeat"
            items="[[states]]"
            on-dom-change="addTapEvents"
          >
          </template>
        </div>
      </op-card>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      states: Array,
      groupEntity: Object,
      title: {
        type: String,
        computed: "computeTitle(states, groupEntity)",
      },
    };
  }

  constructor() {
    super();
    // We need to save a single bound function reference to ensure the event listener
    // can identify it properly.
    this.entityTapped = this.entityTapped.bind(this);
  }

  computeTitle(states, groupEntity) {
    if (groupEntity) {
      return computeStateName(groupEntity).trim();
    }
    const domain = computeStateDomain(states[0]);
    return (
      (`domain.${domain}`) || domain.replace(/_/g, " ")
    );
  }

  computeTitleClass(groupEntity) {
    let classes = "header horizontal layout center ";
    if (groupEntity) {
      classes += "more-info";
    }
    return classes;
  }

  computeStateClass(stateObj) {
    return stateMoreInfoType(stateObj) !== "hidden"
      ? "state more-info"
      : "state";
  }

  addTapEvents() {
    const cards = this.root.querySelectorAll(".state");
    cards.forEach((card) => {
      if (card.classList.contains("more-info")) {
        card.addEventListener("click", this.entityTapped);
      } else {
        card.removeEventListener("click", this.entityTapped);
      }
    });
  }

  entityTapped(ev) {
    const item = this.root
      .querySelector("dom-repeat")
      .itemForElement(ev.target);
    let entityId;
    if (!item && !this.groupEntity) {
      return;
    }
    ev.stopPropagation();

    if (item) {
      entityId = item.entity_id;
    } else {
      entityId = this.groupEntity.entity_id;
    }
    this.fire("opp-more-info", { entityId: entityId });
  }

  showGroupToggle(groupEntity, states) {
    if (
      !groupEntity ||
      !states ||
      groupEntity.attributes.control === "hidden" ||
      (groupEntity.state !== "on" && groupEntity.state !== "off")
    ) {
      return false;
    }

    // Only show if we can toggle 2+ entities in group
    let canToggleCount = 0;
    for (let i = 0; i < states.length; i++) {
      if (!canToggleState(this.opp, states[i])) {
        continue;
      }

      canToggleCount++;

      if (canToggleCount > 1) {
        break;
      }
    }

    return canToggleCount > 1;
  }
}
customElements.define("op-entities-card", OpEntitiesCard);
