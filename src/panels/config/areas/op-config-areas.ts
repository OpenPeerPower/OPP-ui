import {
  LitElement,
  TemplateResult,
  html,
  css,
  CSSResult,
  property,
  customElement,
} from "lit-element";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-item/paper-item-body";

import { OpenPeerPower, Route } from "../../../types";
import {
  AreaRegistryEntry,
  updateAreaRegistryEntry,
  deleteAreaRegistryEntry,
  createAreaRegistryEntry,
  subscribeAreaRegistry,
} from "../../../data/area_registry";
import "../../../components/op-card";
import "../../../components/op-fab";
import "../../../layouts/opp-tabs-subpage";
import "../../../layouts/opp-loading-screen";
import "../op-config-section";
import {
  showAreaRegistryDetailDialog,
  loadAreaRegistryDetailDialog,
} from "./show-dialog-area-registry-detail";
import { classMap } from "lit-html/directives/class-map";
import { computeRTL } from "../../../common/util/compute_rtl";
import { UnsubscribeFunc } from "../../../websocket/lib";
import { configSections } from "../op-panel-config";

@customElement("op-config-areas")
export class OpConfigAreas extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public isWide?: boolean;
  @property() public narrow!: boolean;
  @property() public route!: Route;
  @property() private _areas?: AreaRegistryEntry[];
  private _unsubAreas?: UnsubscribeFunc;

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubAreas) {
      this._unsubAreas();
    }
  }

  protected render(): TemplateResult {
    if (!this.opp || this._areas === undefined) {
      return html`
        <opp-loading-screen></opp-loading-screen>
      `;
    }
    return html`
      <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        back-path="/config"
        .route=${this.route}
        .tabs=${configSections.integrations}
      >
        <op-config-section .isWide=${this.isWide}>
          <span slot="header">
            ${this.opp.localize("ui.panel.config.areas.picker.header")}
          </span>
          <span slot="introduction">
            ${this.opp.localize("ui.panel.config.areas.picker.introduction")}
            <p>
              ${this.opp.localize("ui.panel.config.areas.picker.introduction2")}
            </p>
            <a href="/config/integrations/dashboard">
              ${this.opp.localize(
                "ui.panel.config.areas.picker.integrations_page"
              )}
            </a>
          </span>
          <op-card>
            ${this._areas.map((entry) => {
              return html`
                <paper-item @click=${this._openEditEntry} .entry=${entry}>
                  <paper-item-body>
                    ${entry.name}
                  </paper-item-body>
                </paper-item>
              `;
            })}
            ${this._areas.length === 0
              ? html`
                  <div class="empty">
                    ${this.opp.localize("ui.panel.config.areas.no_areas")}
                    <mwc-button @click=${this._createArea}>
                      ${this.opp.localize("ui.panel.config.areas.create_area")}
                    </mwc-button>
                  </div>
                `
              : html``}
          </op-card>
        </op-config-section>
      </opp-tabs-subpage>

      <op-fab
        ?is-wide=${this.isWide}
        ?narrow=${this.narrow}
        icon="opp:plus"
        title="${this.opp.localize("ui.panel.config.areas.create_area")}"
        @click=${this._createArea}
        class="${classMap({
          rtl: computeRTL(this.opp),
        })}"
      ></op-fab>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    loadAreaRegistryDetailDialog();
  }

  protected updated(changedProps) {
    super.updated(changedProps);
    if (!this._unsubAreas) {
      this._unsubAreas = subscribeAreaRegistry(this.opp.connection, (areas) => {
        this._areas = areas;
      });
    }
  }

  private _createArea() {
    this._openDialog();
  }

  private _openEditEntry(ev: MouseEvent) {
    const entry: AreaRegistryEntry = (ev.currentTarget! as any).entry;
    this._openDialog(entry);
  }
  private _openDialog(entry?: AreaRegistryEntry) {
    showAreaRegistryDetailDialog(this, {
      entry,
      createEntry: async (values) => createAreaRegistryEntry(this.opp!, values),
      updateEntry: async (values) =>
        updateAreaRegistryEntry(this.opp!, entry!.area_id, values),
      removeEntry: async () => {
        if (
          !confirm(`Are you sure you want to delete this area?

All devices in this area will become unassigned.`)
        ) {
          return false;
        }

        try {
          await deleteAreaRegistryEntry(this.opp!, entry!.area_id);
          return true;
        } catch (err) {
          return false;
        }
      },
    });
  }

  static get styles(): CSSResult {
    return css`
      opp-loading-screen {
        --app-header-background-color: var(--sidebar-background-color);
        --app-header-text-color: var(--sidebar-text-color);
      }
      a {
        color: var(--primary-color);
      }
      op-card {
        max-width: 600px;
        margin: 16px auto;
        overflow: hidden;
      }
      .empty {
        text-align: center;
      }
      paper-item {
        cursor: pointer;
        padding-top: 4px;
        padding-bottom: 4px;
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
      op-fab.rtl {
        right: auto;
        left: 16px;
      }

      op-fab[is-wide].rtl {
        bottom: 24px;
        right: auto;
        left: 24px;
      }
    `;
  }
}
