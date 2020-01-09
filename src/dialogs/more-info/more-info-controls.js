import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";
import "@polymer/paper-icon-button/paper-icon-button";
import "@material/mwc-button";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../../components/state-history-charts";
import "../../data/op-state-history-data";
import "../../resources/op-style";
import "../../state-summary/state-card-content";

import "./controls/more-info-content";

import { computeStateName } from "../../common/entity/compute_state_name";
import { computeStateDomain } from "../../common/entity/compute_state_domain";
import { isComponentLoaded } from "../../common/config/is_component_loaded";
import { DOMAINS_MORE_INFO_NO_HISTORY } from "../../common/const";
import { EventsMixin } from "../../mixins/events-mixin";
import LocalizeMixin from "../../mixins/localize-mixin";
import { computeRTL } from "../../common/util/compute_rtl";
import { removeEntityRegistryEntry } from "../../data/entity_registry";
import { showConfirmationDialog } from "../confirmation/show-dialog-confirmation";

const DOMAINS_NO_INFO = ["camera", "configurator", "history_graph"];
/*
 * @appliesMixin EventsMixin
 */
class MoreInfoControls extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style include="op-style-dialog">
        app-toolbar {
          color: var(--more-info-header-color);
          background-color: var(--more-info-header-background);
        }

        app-toolbar [main-title] {
          @apply --op-more-info-app-toolbar-title;
        }

        state-card-content {
          display: block;
          padding: 16px;
        }

        state-history-charts {
          max-width: 100%;
          margin-bottom: 16px;
        }

        @media all and (min-width: 451px) and (min-height: 501px) {
          .main-title {
            pointer-events: auto;
            cursor: default;
          }
        }

        paper-dialog-scrollable {
          padding-bottom: 16px;
        }

        mwc-button.warning {
          --mdc-theme-primary: var(--google-red-500);
        }

        :host([domain="camera"]) paper-dialog-scrollable {
          margin: 0 -24px -21px;
        }

        :host([rtl]) app-toolbar {
          direction: rtl;
          text-align: right;
        }
      </style>

      <app-toolbar>
        <paper-icon-button
          aria-label$="[[localize('ui.dialogs.more_info_control.dismiss')]]"
          icon="opp:close"
          dialog-dismiss
        ></paper-icon-button>
        <div class="main-title" main-title="" on-click="enlarge">
          [[_computeStateName(stateObj)]]
        </div>
        <template is="dom-if" if="[[canConfigure]]">
          <paper-icon-button
            aria-label$="[[localize('ui.dialogs.more_info_control.settings')]]"
            icon="opp:settings"
            on-click="_gotoSettings"
          ></paper-icon-button>
        </template>
      </app-toolbar>

      <template is="dom-if" if="[[_computeShowStateInfo(stateObj)]]" restamp="">
        <state-card-content
          state-obj="[[stateObj]]"
          opp="[[opp]]"
          in-dialog=""
        ></state-card-content>
      </template>
      <paper-dialog-scrollable dialog-element="[[dialogElement]]">
        <template
          is="dom-if"
          if="[[_computeShowHistoryComponent(opp, stateObj)]]"
          restamp=""
        >
          <op-state-history-data
            opp="[[opp]]"
            filter-type="recent-entity"
            entity-id="[[stateObj.entity_id]]"
            data="{{_stateHistory}}"
            is-loading="{{_stateHistoryLoading}}"
            cache-config="[[_cacheConfig]]"
          ></op-state-history-data>
          <state-history-charts
            opp="[[opp]]"
            history-data="[[_stateHistory]]"
            is-loading-data="[[_stateHistoryLoading]]"
            up-to-now
          ></state-history-charts>
        </template>
        <more-info-content
          state-obj="[[stateObj]]"
          opp="[[opp]]"
        ></more-info-content>
        <template
          is="dom-if"
          if="[[_computeShowRestored(stateObj)]]"
          restamp=""
        >
          [[localize('ui.dialogs.more_info_control.restored.not_provided')]] <br />
          [[localize('ui.dialogs.more_info_control.restored.remove_intro')]] <br />
          <mwc-button class="warning" on-click="_removeEntity">[[localize('ui.dialogs.more_info_control.restored.remove_action')]]</mwc-buttom>
        </template>
      </paper-dialog-scrollable>
    `;
  }

  static get properties() {
    return {
      opp: Object,

      stateObj: {
        type: Object,
        observer: "_stateObjChanged",
      },

      dialogElement: Object,
      canConfigure: Boolean,

      domain: {
        type: String,
        reflectToAttribute: true,
        computed: "_computeDomain(stateObj)",
      },

      _stateHistory: Object,
      _stateHistoryLoading: Boolean,

      large: {
        type: Boolean,
        value: false,
        notify: true,
      },

      _cacheConfig: {
        type: Object,
        value: {
          refresh: 60,
          cacheKey: null,
          hoursToShow: 24,
        },
      },
      rtl: {
        type: Boolean,
        reflectToAttribute: true,
        computed: "_computeRTL(opp)",
      },
    };
  }

  enlarge() {
    this.large = !this.large;
  }

  _computeShowStateInfo(stateObj) {
    return !stateObj || !DOMAINS_NO_INFO.includes(computeStateDomain(stateObj));
  }

  _computeShowRestored(stateObj) {
    return stateObj && stateObj.attributes.restored;
  }

  _computeShowHistoryComponent(opp, stateObj) {
    return (
      opp &&
      stateObj &&
      isComponentLoaded(opp, "history") &&
      !DOMAINS_MORE_INFO_NO_HISTORY.includes(computeStateDomain(stateObj))
    );
  }

  _computeDomain(stateObj) {
    return stateObj ? computeStateDomain(stateObj) : "";
  }

  _computeStateName(stateObj) {
    return stateObj ? computeStateName(stateObj) : "";
  }

  _stateObjChanged(newVal) {
    if (!newVal) {
      return;
    }

    if (this._cacheConfig.cacheKey !== `more_info.${newVal.entity_id}`) {
      this._cacheConfig = {
        ...this._cacheConfig,
        cacheKey: `more_info.${newVal.entity_id}`,
      };
    }
  }

  _removeEntity() {
    showConfirmationDialog(this, {
      title: this.localize(
        "ui.dialogs.more_info_control.restored.confirm_remove_title"
      ),
      text: this.localize(
        "ui.dialogs.more_info_control.restored.confirm_remove_text"
      ),
      confirmBtnText: this.localize("ui.common.yes"),
      cancelBtnText: this.localize("ui.common.no"),
      confirm: () =>
        removeEntityRegistryEntry(this.opp, this.stateObj.entity_id),
    });
  }

  _gotoSettings() {
    this.fire("more-info-page", { page: "settings" });
  }

  _computeRTL(opp) {
    return computeRTL(opp);
  }
}
customElements.define("more-info-controls", MoreInfoControls);
