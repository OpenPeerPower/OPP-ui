import {
  customElement,
  LitElement,
  property,
  TemplateResult,
  html,
  CSSResult,
  css,
} from "lit-element";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-item/paper-icon-item";
import "../../../../src/components/op-icon";
import { toggleAttribute } from "../../../../src/common/dom/toggle_attribute";
import { fireEvent } from "../../../common/dom/fire_event";
import { DevconConfig } from "../../../data/devcon";

declare global {
  interface OPPDomEvents {
    "view-selected": {
      view: number;
    };
  }
}

@customElement("hui-views-list")
class HuiViewsList extends LitElement {
  @property() private devconConfig?: DevconConfig | undefined;
  @property() private selected?: number | undefined;

  protected render(): TemplateResult {
    if (!this.devconConfig) {
      return html``;
    }

    return html`
      <paper-listbox attr-for-selected="data-index" .selected=${this.selected}>
        ${this.devconConfig.views.map(
          (view, index) => html`
            <paper-icon-item @click=${this._handlePickView} data-index=${index}>
              ${view.icon
                ? html`
                    <op-icon .icon=${view.icon} slot="item-icon"></op-icon>
                  `
                : ""}
              ${view.title || view.path}
            </paper-icon-item>
          `
        )}
      </paper-listbox>
    `;
  }

  protected updated(changedProps) {
    super.updated(changedProps);
    toggleAttribute(
      this,
      "hide-icons",
      this.devconConfig
        ? !this.devconConfig.views.some((view) => view.icon)
        : true
    );
  }

  private async _handlePickView(ev: Event) {
    const view = Number((ev.currentTarget as any).getAttribute("data-index"));
    fireEvent(this, "view-selected", { view });
  }

  static get styles(): CSSResult {
    return css`
      paper-listbox {
        padding-top: 0;
      }

      paper-listbox op-icon {
        padding: 12px;
        color: var(--secondary-text-color);
      }

      paper-icon-item {
        cursor: pointer;
      }

      paper-icon-item[disabled] {
        cursor: initial;
      }

      :host([hide-icons]) paper-icon-item {
        --paper-item-icon-width: 0px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-views-list": HuiViewsList;
  }
}
