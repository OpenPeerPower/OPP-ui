import {
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  PropertyValues,
  property,
  customElement,
} from "lit-element";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";

import { classMap } from "lit-html/directives/class-map";

import "../../../components/op-fab";
import "../../../components/device/op-device-picker";
import "../../../components/entity/op-entities-picker";
import "../../../components/op-paper-icon-button-arrow-prev";
import "../../../layouts/op-app-layout";

import { computeStateName } from "../../../common/entity/compute_state_name";

import { opStyle } from "../../../resources/styles";
import { OpenPeerPower, Route } from "../../../types";
import { navigate } from "../../../common/navigate";
import { computeRTL } from "../../../common/util/compute_rtl";
import {
  SceneEntity,
  SceneConfig,
  getSceneConfig,
  deleteScene,
  saveScene,
  SCENE_IGNORED_DOMAINS,
  SceneEntities,
  applyScene,
  activateScene,
  getSceneEditorInitData,
} from "../../../data/scene";
import { fireEvent } from "../../../common/dom/fire_event";
import {
  DeviceRegistryEntry,
  subscribeDeviceRegistry,
  computeDeviceName,
} from "../../../data/device_registry";
import {
  EntityRegistryEntry,
  subscribeEntityRegistry,
} from "../../../data/entity_registry";
import { SubscribeMixin } from "../../../mixins/subscribe-mixin";
import memoizeOne from "memoize-one";
import { computeDomain } from "../../../common/entity/compute_domain";
import { OppEvent } from "../../../websocket/lib";
import { showConfirmationDialog } from "../../../dialogs/generic/show-dialog-box";
import { configSections } from "../op-panel-config";

interface DeviceEntities {
  id: string;
  name: string;
  entities: string[];
}

interface DeviceEntitiesLookup {
  [deviceId: string]: string[];
}

@customElement("op-scene-editor")
export class OpSceneEditor extends SubscribeMixin(LitElement) {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() public route!: Route;
  @property() public scene?: SceneEntity;
  @property() public creatingNew?: boolean;
  @property() public showAdvanced!: boolean;
  @property() private _dirty?: boolean;
  @property() private _errors?: string;
  @property() private _config!: SceneConfig;
  @property() private _entities: string[] = [];
  @property() private _devices: string[] = [];
  @property() private _deviceRegistryEntries: DeviceRegistryEntry[] = [];
  @property() private _entityRegistryEntries: EntityRegistryEntry[] = [];
  private _storedStates: SceneEntities = {};
  private _unsubscribeEvents?: () => void;
  @property() private _deviceEntityLookup: DeviceEntitiesLookup = {};
  private _activateContextId?: string;

  private _getEntitiesDevices = memoizeOne(
    (
      entities: string[],
      devices: string[],
      deviceEntityLookup: DeviceEntitiesLookup,
      deviceRegs: DeviceRegistryEntry[]
    ) => {
      const outputDevices: DeviceEntities[] = [];

      if (devices.length) {
        const deviceLookup: { [deviceId: string]: DeviceRegistryEntry } = {};
        for (const device of deviceRegs) {
          deviceLookup[device.id] = device;
        }

        devices.forEach((deviceId) => {
          const device = deviceLookup[deviceId];
          const deviceEntities: string[] = deviceEntityLookup[deviceId] || [];
          outputDevices.push({
            name: computeDeviceName(
              device,
              this.opp,
              this._deviceEntityLookup[device.id]
            ),
            id: device.id,
            entities: deviceEntities,
          });
        });
      }

      const outputEntities: string[] = [];

      entities.forEach((entity) => {
        if (!outputDevices.find((device) => device.entities.includes(entity))) {
          outputEntities.push(entity);
        }
      });

      return { devices: outputDevices, entities: outputEntities };
    }
  );

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeEvents) {
      this._unsubscribeEvents();
      this._unsubscribeEvents = undefined;
    }
  }

  public oppSubscribe() {
    return [
      subscribeEntityRegistry(this.opp.connection, (entries) => {
        this._entityRegistryEntries = entries;
      }),
      subscribeDeviceRegistry(this.opp.connection, (entries) => {
        this._deviceRegistryEntries = entries;
      }),
    ];
  }

  protected render(): TemplateResult {
    if (!this.opp) {
      return html``;
    }
    const { devices, entities } = this._getEntitiesDevices(
      this._entities,
      this._devices,
      this._deviceEntityLookup,
      this._deviceRegistryEntries
    );
    const name = this.scene
      ? computeStateName(this.scene)
      : this.opp.localize("ui.panel.config.scene.editor.default_name");

    return html`
        <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        .route=${this.route}
        .backCallback=${() => this._backTapped()}
        .tabs=${configSections.automation}
      >

      ${
        this.creatingNew
          ? ""
          : html`
              <paper-icon-button
                slot="toolbar-icon"
                title="${this.opp.localize(
                  "ui.panel.config.scene.picker.delete_scene"
                )}"
                icon="opp:delete"
                @click=${this._deleteTapped}
              ></paper-icon-button>
            `
      }

          ${
            this._errors
              ? html`
                  <div class="errors">${this._errors}</div>
                `
              : ""
          }
          ${
            this.narrow
              ? html`
                  <span slot="header">${name}</span>
                `
              : ""
          }
          <div
            id="root"
            class="${classMap({
              rtl: computeRTL(this.opp),
            })}"
          >
            <op-config-section .isWide=${this.isWide}>
              ${
                !this.narrow
                  ? html`
                      <span slot="header">${name}</span>
                    `
                  : ""
              }
              <div slot="introduction">
                ${this.opp.localize(
                  "ui.panel.config.scene.editor.introduction"
                )}
              </div>
              <op-card>
                <div class="card-content">
                  <paper-input
                    .value=${this.scene ? computeStateName(this.scene) : ""}
                    @value-changed=${this._nameChanged}
                    label=${this.opp.localize(
                      "ui.panel.config.scene.editor.name"
                    )}
                  ></paper-input>
                </div>
              </op-card>
            </op-config-section>

            <op-config-section .isWide=${this.isWide}>
              <div slot="header">
                ${this.opp.localize(
                  "ui.panel.config.scene.editor.devices.header"
                )}
              </div>
              <div slot="introduction">
                ${this.opp.localize(
                  "ui.panel.config.scene.editor.devices.introduction"
                )}
              </div>

              ${devices.map(
                (device) =>
                  html`
                    <op-card>
                      <div class="card-header">
                        ${device.name}
                        <paper-icon-button
                          icon="opp:delete"
                          title="${this.opp.localize(
                            "ui.panel.config.scene.editor.devices.delete"
                          )}"
                          .device=${device.id}
                          @click=${this._deleteDevice}
                        ></paper-icon-button>
                      </div>
                      ${device.entities.map((entityId) => {
                        const stateObj = this.opp.states[entityId];
                        if (!stateObj) {
                          return html``;
                        }
                        return html`
                          <paper-icon-item
                            .entityId=${entityId}
                            @click=${this._showMoreInfo}
                            class="device-entity"
                          >
                            <state-badge
                              .stateObj=${stateObj}
                              slot="item-icon"
                            ></state-badge>
                            <paper-item-body>
                              ${computeStateName(stateObj)}
                            </paper-item-body>
                          </paper-icon-item>
                        `;
                      })}
                    </op-card>
                  `
              )}

              <op-card
                .header=${this.opp.localize(
                  "ui.panel.config.scene.editor.devices.add"
                )}
              >
                <div class="card-content">
                  <op-device-picker
                    @value-changed=${this._devicePicked}
                    .opp=${this.opp}
                    .label=${this.opp.localize(
                      "ui.panel.config.scene.editor.devices.add"
                    )}
                  />
                </div>
              </op-card>
            </op-config-section>

            ${
              this.showAdvanced
                ? html`
                    <op-config-section .isWide=${this.isWide}>
                      <div slot="header">
                        ${this.opp.localize(
                          "ui.panel.config.scene.editor.entities.header"
                        )}
                      </div>
                      <div slot="introduction">
                        ${this.opp.localize(
                          "ui.panel.config.scene.editor.entities.introduction"
                        )}
                      </div>
                      ${entities.length
                        ? html`
                            <op-card
                              class="entities"
                              .header=${this.opp.localize(
                                "ui.panel.config.scene.editor.entities.without_device"
                              )}
                            >
                              ${entities.map((entityId) => {
                                const stateObj = this.opp.states[entityId];
                                if (!stateObj) {
                                  return html``;
                                }
                                return html`
                                  <paper-icon-item
                                    .entityId=${entityId}
                                    @click=${this._showMoreInfo}
                                    class="device-entity"
                                  >
                                    <state-badge
                                      .stateObj=${stateObj}
                                      slot="item-icon"
                                    ></state-badge>
                                    <paper-item-body>
                                      ${computeStateName(stateObj)}
                                    </paper-item-body>
                                    <paper-icon-button
                                      icon="opp:delete"
                                      .entityId=${entityId}
                                      .title="${this.opp.localize(
                                        "ui.panel.config.scene.editor.entities.delete"
                                      )}"
                                      @click=${this._deleteEntity}
                                    ></paper-icon-button>
                                  </paper-icon-item>
                                `;
                              })}
                            </op-card>
                          `
                        : ""}

                      <op-card
                        header=${this.opp.localize(
                          "ui.panel.config.scene.editor.entities.add"
                        )}
                      >
                        <div class="card-content">
                          ${this.opp.localize(
                            "ui.panel.config.scene.editor.entities.device_entities"
                          )}
                          <op-entity-picker
                            @value-changed=${this._entityPicked}
                            .excludeDomains=${SCENE_IGNORED_DOMAINS}
                            .opp=${this.opp}
                            label=${this.opp.localize(
                              "ui.panel.config.scene.editor.entities.add"
                            )}
                          />
                        </div>
                      </op-card>
                    </op-config-section>
                  `
                : ""
            }
          </div>
        <op-fab
          ?is-wide="${this.isWide}"
          ?narrow="${this.narrow}"
          ?dirty="${this._dirty}"
          icon="opp:content-save"
          .title="${this.opp.localize("ui.panel.config.scene.editor.save")}"
          @click=${this._saveScene}
          class="${classMap({
            rtl: computeRTL(this.opp),
          })}"
        ></op-fab>
      </op-app-layout>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    const oldscene = changedProps.get("scene") as SceneEntity;

    if (
      changedProps.has("scene") &&
      this.scene &&
      this.opp &&
      // Only refresh config if we picked a new scene. If same ID, don't fetch it.
      (!oldscene || oldscene.attributes.id !== this.scene.attributes.id)
    ) {
      this._loadConfig();
    }

    if (changedProps.has("creatingNew") && this.creatingNew && this.opp) {
      this._dirty = false;
      const initData = getSceneEditorInitData();
      this._config = {
        name: this.opp.localize("ui.panel.config.scene.editor.default_name"),
        entities: {},
        ...initData,
      };
      this._initEntities(this._config);
      if (initData) {
        this._dirty = true;
      }
    }

    if (changedProps.has("_entityRegistryEntries")) {
      for (const entity of this._entityRegistryEntries) {
        if (
          !entity.device_id ||
          SCENE_IGNORED_DOMAINS.includes(computeDomain(entity.entity_id))
        ) {
          continue;
        }
        if (!(entity.device_id in this._deviceEntityLookup)) {
          this._deviceEntityLookup[entity.device_id] = [];
        }
        if (
          !this._deviceEntityLookup[entity.device_id].includes(entity.entity_id)
        ) {
          this._deviceEntityLookup[entity.device_id].push(entity.entity_id);
        }
        if (
          this._entities.includes(entity.entity_id) &&
          !this._devices.includes(entity.device_id)
        ) {
          this._devices = [...this._devices, entity.device_id];
        }
      }
    }
  }

  private _showMoreInfo(ev: Event) {
    const entityId = (ev.currentTarget as any).entityId;
    fireEvent(this, "opp-more-info", { entityId });
  }

  private async _loadConfig() {
    let config: SceneConfig;
    try {
      config = await getSceneConfig(this.opp, this.scene!.attributes.id!);
    } catch (err) {
      alert(
        err.status_code === 404
          ? this.opp.localize(
              "ui.panel.config.scene.editor.load_error_not_editable"
            )
          : this.opp.localize(
              "ui.panel.config.scene.editor.load_error_unknown",
              "err_no",
              err.status_code
            )
      );
      history.back();
      return;
    }

    if (!config.entities) {
      config.entities = {};
    }

    this._initEntities(config);

    const { context } = await activateScene(this.opp, this.scene!.entity_id);

    this._activateContextId = context.id;

    this._unsubscribeEvents = await this.opp!.connection.subscribeEvents<
      OppEvent
    >((event) => this._stateChanged(event), "state_changed");

    this._dirty = false;
    this._config = config;
  }

  private _initEntities(config: SceneConfig) {
    this._entities = Object.keys(config.entities);
    this._entities.forEach((entity) => this._storeState(entity));

    const filteredEntityReg = this._entityRegistryEntries.filter((entityReg) =>
      this._entities.includes(entityReg.entity_id)
    );
    this._devices = [];

    for (const entityReg of filteredEntityReg) {
      if (!entityReg.device_id) {
        continue;
      }
      if (!this._devices.includes(entityReg.device_id)) {
        this._devices = [...this._devices, entityReg.device_id];
      }
    }
  }

  private _entityPicked(ev: CustomEvent) {
    const entityId = ev.detail.value;
    (ev.target as any).value = "";
    if (this._entities.includes(entityId)) {
      return;
    }
    this._entities = [...this._entities, entityId];
    this._storeState(entityId);
    this._dirty = true;
  }

  private _deleteEntity(ev: Event) {
    ev.stopPropagation();
    const deleteEntityId = (ev.target as any).entityId;
    this._entities = this._entities.filter(
      (entityId) => entityId !== deleteEntityId
    );
    this._dirty = true;
  }

  private _devicePicked(ev: CustomEvent) {
    const device = ev.detail.value;
    (ev.target as any).value = "";
    if (this._devices.includes(device)) {
      return;
    }
    this._devices = [...this._devices, device];
    const deviceEntities = this._deviceEntityLookup[device];
    if (!deviceEntities) {
      return;
    }
    this._entities = [...this._entities, ...deviceEntities];
    deviceEntities.forEach((entityId) => {
      this._storeState(entityId);
    });
    this._dirty = true;
  }

  private _deleteDevice(ev: Event) {
    const deviceId = (ev.target as any).device;
    this._devices = this._devices.filter((device) => device !== deviceId);
    const deviceEntities = this._deviceEntityLookup[deviceId];
    if (!deviceEntities) {
      return;
    }
    this._entities = this._entities.filter(
      (entityId) => !deviceEntities.includes(entityId)
    );
    this._dirty = true;
  }

  private _nameChanged(ev: CustomEvent) {
    if (!this._config || this._config.name === ev.detail.value) {
      return;
    }
    this._config.name = ev.detail.value;
    this._dirty = true;
  }

  private _stateChanged(event: OppEvent) {
    if (
      event.context.id !== this._activateContextId &&
      this._entities.includes(event.data.entity_id)
    ) {
      this._dirty = true;
    }
  }

  private _backTapped(): void {
    if (this._dirty) {
      showConfirmationDialog(this, {
        text: this.opp!.localize(
          "ui.panel.config.scene.editor.unsaved_confirm"
        ),
        confirmText: this.opp!.localize("ui.common.yes"),
        dismissText: this.opp!.localize("ui.common.no"),
        confirm: () => this._goBack(),
      });
    } else {
      this._goBack();
    }
  }

  private _goBack(): void {
    applyScene(this.opp, this._storedStates);
    history.back();
  }

  private _deleteTapped(): void {
    showConfirmationDialog(this, {
      text: this.opp!.localize("ui.panel.config.scene.picker.delete_confirm"),
      confirmText: this.opp!.localize("ui.common.yes"),
      dismissText: this.opp!.localize("ui.common.no"),
      confirm: () => this._delete(),
    });
  }

  private async _delete(): Promise<void> {
    await deleteScene(this.opp, this.scene!.attributes.id!);
    applyScene(this.opp, this._storedStates);
    history.back();
  }

  private _calculateStates(): SceneEntities {
    const output: SceneEntities = {};
    this._entities.forEach((entityId) => {
      const state = this._getCurrentState(entityId);
      if (state) {
        output[entityId] = state;
      }
    });
    return output;
  }

  private _storeState(entityId: string): void {
    if (entityId in this._storedStates) {
      return;
    }
    const state = this._getCurrentState(entityId);
    if (!state) {
      return;
    }
    this._storedStates[entityId] = state;
  }

  private _getCurrentState(entityId: string) {
    const stateObj = this.opp.states[entityId];
    if (!stateObj) {
      return;
    }
    return { ...stateObj.attributes, state: stateObj.state };
  }

  private async _saveScene(): Promise<void> {
    const id = this.creatingNew ? "" + Date.now() : this.scene!.attributes.id!;
    this._config = { ...this._config, entities: this._calculateStates() };
    try {
      await saveScene(this.opp, id, this._config);
      this._dirty = false;

      if (this.creatingNew) {
        navigate(this, `/config/scene/edit/${id}`, true);
      }
    } catch (err) {
      this._errors = err.body.message || err.message;
      throw err;
    }
  }

  static get styles(): CSSResult[] {
    return [
      opStyle,
      css`
        op-card {
          overflow: hidden;
        }
        .errors {
          padding: 20px;
          font-weight: bold;
          color: var(--google-red-500);
        }
        .content {
          padding-bottom: 20px;
        }
        .triggers,
        .script {
          margin-top: -16px;
        }
        .triggers op-card,
        .script op-card {
          margin-top: 16px;
        }
        .add-card mwc-button {
          display: block;
          text-align: center;
        }
        .card-menu {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 1;
          color: var(--primary-text-color);
        }
        .rtl .card-menu {
          right: auto;
          left: 0;
        }
        .card-menu paper-item {
          cursor: pointer;
        }
        paper-icon-item {
          padding: 8px 16px;
        }
        op-card paper-icon-button {
          color: var(--secondary-text-color);
        }
        .card-header > paper-icon-button {
          float: right;
          position: relative;
          top: -8px;
        }
        .device-entity {
          cursor: pointer;
        }
        span[slot="introduction"] a {
          color: var(--primary-color);
        }
        op-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
          margin-bottom: -80px;
          transition: margin-bottom 0.3s;
        }

        op-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }
        op-fab[narrow] {
          bottom: 84px;
          margin-bottom: -140px;
        }
        op-fab[dirty] {
          margin-bottom: 0;
        }

        op-fab.rtl {
          right: auto;
          left: 16px;
        }

        op-fab[is-wide].rtl {
          bottom: 24px;
          right: auto;
          left: 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-scene-editor": OpSceneEditor;
  }
}
