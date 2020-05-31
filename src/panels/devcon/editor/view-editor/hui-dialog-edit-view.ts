import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
} from "lit-element";

import { OpenPeerPower } from "../../../../types";
import { OPPDomEvent } from "../../../../common/dom/fire_event";
import "./hui-edit-view";
import { EditViewDialogParams } from "./show-edit-view-dialog";

declare global {
  // for fire event
  interface OPPDomEvents {
    "reload-devcon": undefined;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "reload-devcon": OPPDomEvent<undefined>;
  }
}

@customElement("hui-dialog-edit-view")
export class HuiDialogEditView extends LitElement {
  @property() protected opp?: OpenPeerPower;

  @property() private _params?: EditViewDialogParams;

  public async showDialog(params: EditViewDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
    (this.shadowRoot!.children[0] as any).showDialog();
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }
    return html`
      <hui-edit-view
        .opp="${this.opp}"
        .devcon="${this._params.devcon}"
        .viewIndex="${this._params.viewIndex}"
      >
      </hui-edit-view>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-edit-view": HuiDialogEditView;
  }
}
