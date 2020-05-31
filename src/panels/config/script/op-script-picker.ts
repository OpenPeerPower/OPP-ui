import {
  LitElement,
  html,
  CSSResultArray,
  css,
  TemplateResult,
  property,
  customElement,
} from "lit-element";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-item-body";
import { OppEntity } from "../../../websocket/lib";

import "../../../layouts/opp-tabs-subpage";

import { computeRTL } from "../../../common/util/compute_rtl";

import "../../../components/op-card";
import "../../../components/op-fab";

import "../op-config-section";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { opStyle } from "../../../resources/styles";
import { OpenPeerPower, Route } from "../../../types";
import { triggerScript } from "../../../data/script";
import { showToast } from "../../../util/toast";
import { configSections } from "../op-panel-config";

@customElement("op-script-picker")
class OpScriptPicker extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public scripts!: OppEntity[];
  @property() public isWide!: boolean;
  @property() public narrow!: boolean;
  @property() public route!: Route;

  protected render(): TemplateResult {
    return html`
      <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        back-path="/config"
        .route=${this.route}
        .tabs=${configSections.automation}
      >
        <op-config-section .isWide=${this.isWide}>
          <div slot="header">
            ${this.opp.localize("ui.panel.config.script.picker.header")}
          </div>
          <div slot="introduction">
            ${this.opp.localize("ui.panel.config.script.picker.introduction")}
            <p>
              <a
                href="https://open-peer-power.io/docs/scripts/editor/"
                target="_blank"
              >
                ${this.opp.localize("ui.panel.config.script.picker.learn_more")}
              </a>
            </p>
          </div>

          <op-card>
            ${this.scripts.length === 0
              ? html`
                  <div class="card-content">
                    <p>
                      ${this.opp.localize(
                        "ui.panel.config.script.picker.no_scripts"
                      )}
                    </p>
                  </div>
                `
              : this.scripts.map(
                  (script) => html`
                    <div class="script">
                      <paper-icon-button
                        .script=${script}
                        icon="opp:play"
                        title="${this.opp.localize(
                          "ui.panel.config.script.picker.trigger_script"
                        )}"
                        @click=${this._runScript}
                      ></paper-icon-button>
                      <paper-item-body two-line>
                        <div>${computeStateName(script)}</div>
                      </paper-item-body>
                      <div class="actions">
                        <a href=${`/config/script/edit/${script.entity_id}`}>
                          <paper-icon-button
                            icon="opp:pencil"
                            title="${this.opp.localize(
                              "ui.panel.config.script.picker.edit_script"
                            )}"
                          ></paper-icon-button>
                        </a>
                      </div>
                    </div>
                  `
                )}
          </op-card>
        </op-config-section>

        <a href="/config/script/new">
          <op-fab
            ?is-wide=${this.isWide}
            ?narrow=${this.narrow}
            icon="opp:plus"
            title="${this.opp.localize(
              "ui.panel.config.script.picker.add_script"
            )}"
            ?rtl=${computeRTL(this.opp)}
          ></op-fab>
        </a>
      </opp-tabs-subpage>
    `;
  }

  private async _runScript(ev) {
    const script = ev.currentTarget.script as OppEntity;
    await triggerScript(this.opp, script.entity_id);
    showToast(this, {
      message: this.opp.localize(
        "ui.notification_toast.triggered",
        "name",
        computeStateName(script)
      ),
    });
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        :host {
          display: block;
        }

        op-card {
          margin-bottom: 56px;
        }

        .script {
          display: flex;
          flex-direction: horizontal;
          align-items: center;
          padding: 0 8px 0 16px;
        }

        .script > *:first-child {
          margin-right: 8px;
        }

        .script a[href],
        paper-icon-button {
          color: var(--primary-text-color);
        }

        .actions {
          display: flex;
        }

        op-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
        }

        op-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }
        op-fab[narrow] {
          bottom: 84px;
        }
        op-fab[rtl] {
          right: auto;
          left: 16px;
        }

        op-fab[rtl][is-wide] {
          bottom: 24px;
          right: auto;
          left: 24px;
        }

        a {
          color: var(--primary-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-script-picker": OpScriptPicker;
  }
}
