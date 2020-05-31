import {
  LitElement,
  TemplateResult,
  html,
  customElement,
  CSSResult,
  css,
  property,
} from "lit-element";
import { DevconConfig } from "../../../../src/data/devcon";
import "../../../../src/panels/devcon/views/hui-view";
import "../../../../src/panels/devcon/views/hui-panel-view";
import { OpenPeerPower } from "../../../../src/types";
import { Devcon } from "../../../../src/panels/devcon/types";
import "./hc-launch-screen";

@customElement("hc-devcon")
class HcDevcon extends LitElement {
  @property() public opp!: OpenPeerPower;

  @property() public devconConfig!: DevconConfig;

  @property() public viewPath?: string | number;

  protected render(): TemplateResult {
    const index = this._viewIndex;
    if (index === undefined) {
      return html`
        <hc-launch-screen
          .opp=${this.opp}
          .error=${`Unable to find a view with path ${this.viewPath}`}
        ></hc-launch-screen>
      `;
    }
    const devcon: Devcon = {
      config: this.devconConfig,
      editMode: false,
      enableFullEditMode: () => undefined,
      mode: "storage",
      language: "en",
      saveConfig: async () => undefined,
      deleteConfig: async () => undefined,
      setEditMode: () => undefined,
    };
    return this.devconConfig.views[index].panel
      ? html`
          <hui-panel-view
            .opp=${this.opp}
            .config=${this.devconConfig.views[index]}
          ></hui-panel-view>
        `
      : html`
          <hui-view
            .opp=${this.opp}
            .devcon=${devcon}
            .index=${index}
            columns="2"
          ></hui-view>
        `;
  }

  protected updated(changedProps) {
    super.updated(changedProps);

    if (changedProps.has("viewPath") || changedProps.has("devconConfig")) {
      const index = this._viewIndex;

      if (index !== undefined) {
        const configBackground =
          this.devconConfig.views[index].background ||
          this.devconConfig.background;

        if (configBackground) {
          (this.shadowRoot!.querySelector(
            "hui-view, hui-panel-view"
          ) as HTMLElement)!.style.setProperty(
            "--devcon-background",
            configBackground
          );
        }
      }
    }
  }

  private get _viewIndex() {
    const selectedView = this.viewPath;
    const selectedViewInt = parseInt(selectedView as string, 10);
    for (let i = 0; i < this.devconConfig.views.length; i++) {
      if (
        this.devconConfig.views[i].path === selectedView ||
        i === selectedViewInt
      ) {
        return i;
      }
    }
    return undefined;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        background: var(--primary-background-color);
      }
      :host > * {
        flex: 1;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-devcon": HcDevcon;
  }
}
