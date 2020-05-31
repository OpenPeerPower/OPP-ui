import {
  customElement,
  LitElement,
  property,
  CSSResultArray,
  css,
  TemplateResult,
  html,
} from "lit-element";
import "../../components/dialog/op-paper-dialog";
import { OpenPeerPower } from "../../types";
import { OpDomainTogglerDialogParams } from "./show-dialog-domain-toggler";
import { PolymerChangedEvent } from "../../polymer-types";
import { opStyleDialog } from "../../resources/styles";

@customElement("dialog-domain-toggler")
class DomainTogglerDialog extends LitElement {
  public opp!: OpenPeerPower;
  @property() private _params?: OpDomainTogglerDialogParams;

  public async showDialog(params: OpDomainTogglerDialogParams): Promise<void> {
    this._params = params;
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }

    const domains = this._params.domains
      .map((domain) => [this.opp.localize(`domain.${domain}`), domain])
      .sort();

    return html`
      <op-paper-dialog
        with-backdrop
        opened
        @opened-changed=${this._openedChanged}
      >
        <h2>
          ${this.opp.localize("ui.dialogs.domain_toggler.title")}
        </h2>
        <div>
          ${domains.map(
            (domain) =>
              html`
                <div>${domain[0]}</div>
                <mwc-button .domain=${domain[1]} @click=${this._handleOff}>
                  ${this.opp.localize("state.default.off")}
                </mwc-button>
                <mwc-button .domain=${domain[1]} @click=${this._handleOn}>
                  ${this.opp.localize("state.default.on")}
                </mwc-button>
              `
          )}
        </div>
      </op-paper-dialog>
    `;
  }

  private _openedChanged(ev: PolymerChangedEvent<boolean>): void {
    // Closed dialog by clicking on the overlay
    if (!ev.detail.value) {
      this._params = undefined;
    }
  }

  private _handleOff(ev) {
    this._params!.toggleDomain(ev.currentTarget.domain, false);
    ev.currentTarget.blur();
  }

  private _handleOn(ev) {
    this._params!.toggleDomain(ev.currentTarget.domain, true);
    ev.currentTarget.blur();
  }

  static get styles(): CSSResultArray {
    return [
      opStyleDialog,
      css`
        op-paper-dialog {
          max-width: 500px;
        }
        div {
          display: grid;
          grid-template-columns: auto auto auto;
          align-items: center;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-domain-toggler": DomainTogglerDialog;
  }
}
