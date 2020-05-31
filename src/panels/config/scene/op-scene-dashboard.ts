import {
  LitElement,
  TemplateResult,
  html,
  CSSResultArray,
  css,
  property,
  customElement,
} from "lit-element";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-item-body";
import "@polymer/paper-tooltip/paper-tooltip";
import "../../../layouts/opp-tabs-subpage";

import "../../../components/op-card";
import "../../../components/op-fab";

import "../op-config-section";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { computeRTL } from "../../../common/util/compute_rtl";
import { opStyle } from "../../../resources/styles";
import { OpenPeerPower, Route } from "../../../types";
import { SceneEntity, activateScene } from "../../../data/scene";
import { showToast } from "../../../util/toast";
import { ifDefined } from "lit-html/directives/if-defined";
import { forwardHaptic } from "../../../data/haptics";
import { configSections } from "../op-panel-config";

@customElement("op-scene-dashboard")
class OpSceneDashboard extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() public route!: Route;
  @property() public scenes!: SceneEntity[];

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
            ${this.opp.localize("ui.panel.config.scene.picker.header")}
          </div>
          <div slot="introduction">
            ${this.opp.localize("ui.panel.config.scene.picker.introduction")}
            <p>
              <a
                href="https://open-peer-power.io/docs/scene/editor/"
                target="_blank"
              >
                ${this.opp.localize("ui.panel.config.scene.picker.learn_more")}
              </a>
            </p>
          </div>

          <op-card
            .heading=${this.opp.localize(
              "ui.panel.config.scene.picker.pick_scene"
            )}
          >
            ${this.scenes.length === 0
              ? html`
                  <div class="card-content">
                    <p>
                      ${this.opp.localize(
                        "ui.panel.config.scene.picker.no_scenes"
                      )}
                    </p>
                  </div>
                `
              : this.scenes.map(
                  (scene) => html`
                    <div class="scene">
                      <paper-icon-button
                        .scene=${scene}
                        icon="opp:play"
                        title="${this.opp.localize(
                          "ui.panel.config.scene.picker.activate_scene"
                        )}"
                        @click=${this._activateScene}
                      ></paper-icon-button>
                      <paper-item-body two-line>
                        <div>${computeStateName(scene)}</div>
                      </paper-item-body>
                      <div class="actions">
                        <a
                          href=${ifDefined(
                            scene.attributes.id
                              ? `/config/scene/edit/${scene.attributes.id}`
                              : undefined
                          )}
                        >
                          <paper-icon-button
                            title="${this.opp.localize(
                              "ui.panel.config.scene.picker.edit_scene"
                            )}"
                            icon="opp:pencil"
                            .disabled=${!scene.attributes.id}
                          ></paper-icon-button>
                          ${!scene.attributes.id
                            ? html`
                                <paper-tooltip position="left">
                                  ${this.opp.localize(
                                    "ui.panel.config.scene.picker.only_editable"
                                  )}
                                </paper-tooltip>
                              `
                            : ""}
                        </a>
                      </div>
                    </div>
                  `
                )}
          </op-card>
        </op-config-section>
        <a href="/config/scene/edit/new">
          <op-fab
            ?is-wide=${this.isWide}
            ?narrow=${this.narrow}
            icon="opp:plus"
            title=${this.opp.localize("ui.panel.config.scene.picker.add_scene")}
            ?rtl=${computeRTL(this.opp)}
          ></op-fab>
        </a>
      </opp-tabs-subpage>
    `;
  }

  private async _activateScene(ev) {
    const scene = ev.target.scene as SceneEntity;
    await activateScene(this.opp, scene.entity_id);
    showToast(this, {
      message: this.opp.localize(
        "ui.panel.config.scene.activated",
        "name",
        computeStateName(scene)
      ),
    });
    forwardHaptic("light");
  }

  static get styles(): CSSResultArray {
    return [
      opStyle,
      css`
        :host {
          display: block;
          height: 100%;
        }

        op-card {
          margin-bottom: 56px;
        }

        .scene {
          display: flex;
          flex-direction: horizontal;
          align-items: center;
          padding: 0 8px 0 16px;
        }

        .scene > *:first-child {
          margin-right: 8px;
        }

        .scene a[href] {
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
    "op-scene-dashboard": OpSceneDashboard;
  }
}
