import {
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  PropertyDeclarations,
  PropertyValues,
} from "lit-element";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-fab/paper-fab";
import { classMap } from "lit-html/directives/class-map";

import { h, render } from "preact";

import "../../../components/op-paper-icon-button-arrow-prev";
import "../../../layouts/op-app-layout";

import Automation from "../js/automation";
import unmountPreact from "../../../common/preact/unmount";
import computeStateName from "../../../common/entity/compute_state_name";

import { opStyle } from "../../../resources/styles";
import { OpenPeerPower } from "../../../types";
import { AutomationEntity, AutomationConfig } from "../../../data/automation";
import { navigate } from "../../../common/navigate";
import { computeRTL } from "../../../common/util/compute_rtl";

function AutomationEditor(mountEl, props, mergeEl) {
  return render(h(Automation, props), mountEl, mergeEl);
}

class HaAutomationEditor extends LitElement {
  public opp?: OpenPeerPower;
  public automation?: AutomationEntity;
  public isWide?: boolean;
  public creatingNew?: boolean;
  private _config?: AutomationConfig;
  private _dirty?: boolean;
  private _rendered?: unknown;
  private _errors?: string;

  static get properties(): PropertyDeclarations {
    return {
      opp: {},
      automation: {},
      creatingNew: {},
      isWide: {},
      _errors: {},
      _dirty: {},
      _config: {},
    };
  }

  constructor() {
    super();
    this._configChanged = this._configChanged.bind(this);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._rendered) {
      unmountPreact(this._rendered);
      this._rendered = undefined;
    }
  }

  protected render(): TemplateResult | void {
    if (!this.opp) {
      return;
    }
    return html`
      <op-app-layout has-scrolling-region>
        <app-header slot="header" fixed>
          <app-toolbar>
            <op-paper-icon-button-arrow-prev
              @click=${this._backTapped}
            ></op-paper-icon-button-arrow-prev>
            <div main-title>
              ${this.automation
                ? computeStateName(this.automation)
                : this.opp.localize(
                    "ui.panel.config.automation.editor.default_name"
                  )}
            </div>
          </app-toolbar>
        </app-header>

        <div class="content">
          ${this._errors
            ? html`
                <div class="errors">${this._errors}</div>
              `
            : ""}
          <div
            id="root"
            class="${classMap({
              rtl: computeRTL(this.opp),
            })}"
          ></div>
        </div>
        <paper-fab
          slot="fab"
          ?is-wide="${this.isWide}"
          ?dirty="${this._dirty}"
          icon="opp:content-save"
          .title="${this.opp.localize(
            "ui.panel.config.automation.editor.save"
          )}"
          @click=${this._saveAutomation}
          class="${classMap({
            rtl: computeRTL(this.opp),
          })}"
        ></paper-fab>
      </op-app-layout>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    const oldAutomation = changedProps.get("automation") as AutomationEntity;
    if (
      changedProps.has("automation") &&
      this.automation &&
      this.opp &&
      // Only refresh config if we picked a new automation. If same ID, don't fetch it.
      (!oldAutomation ||
        oldAutomation.attributes.id !== this.automation.attributes.id)
    ) {
      this.opp
        .callApi<AutomationConfig>(
          "GET",
          `config/automation/config/${this.automation.attributes.id}`
        )
        .then((config) => {
          // Normalize data: ensure trigger, action and condition are lists
          // Happens when people copy paste their automations into the config
          for (const key of ["trigger", "condition", "action"]) {
            const value = config[key];
            if (value && !Array.isArray(value)) {
              config[key] = [value];
            }
          }
          this._dirty = false;
          this._config = config;
        });
    }

    if (changedProps.has("creatingNew") && this.creatingNew && this.opp) {
      this._dirty = false;
      this._config = {
        alias: this.opp.localize(
          "ui.panel.config.automation.editor.default_name"
        ),
        trigger: [{ platform: "state" }],
        condition: [],
        action: [{ service: "" }],
      };
    }

    if (changedProps.has("_config") && this.opp) {
      this._rendered = AutomationEditor(
        this.shadowRoot!.querySelector("#root"),
        {
          automation: this._config,
          onChange: this._configChanged,
          isWide: this.isWide,
          opp: this.opp,
          localize: this.opp.localize,
        },
        this._rendered
      );
    }
  }

  private _configChanged(config: AutomationConfig): void {
    // onChange gets called a lot during initial rendering causing recursing calls.
    if (!this._rendered) {
      return;
    }
    this._config = config;
    this._errors = undefined;
    this._dirty = true;
    // this._updateComponent();
  }

  private _backTapped(): void {
    if (
      this._dirty &&
      !confirm(
        this.opp!.localize("ui.panel.config.automation.editor.unsaved_confirm")
      )
    ) {
      return;
    }
    history.back();
  }

  private _saveAutomation(): void {
    const id = this.creatingNew
      ? "" + Date.now()
      : this.automation!.attributes.id;
    this.opp!.callApi(
      "POST",
      "config/automation/config/" + id,
      this._config
    ).then(
      () => {
        this._dirty = false;

        if (this.creatingNew) {
          navigate(this, `/config/automation/edit/${id}`, true);
        }
      },
      (errors) => {
        this._errors = errors.body.message;
        throw errors;
      }
    );
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
        span[slot="introduction"] a {
          color: var(--primary-color);
        }
        paper-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
          margin-bottom: -80px;
          transition: margin-bottom 0.3s;
        }

        paper-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }

        paper-fab[dirty] {
          margin-bottom: 0;
        }

        paper-fab.rtl {
          right: auto;
          left: 16px;
        }

        paper-fab[is-wide].rtl {
          bottom: 24px;
          right: auto;
          left: 24px;
        }
      `,
    ];
  }
}

customElements.define("op-automation-editor", HaAutomationEditor);
