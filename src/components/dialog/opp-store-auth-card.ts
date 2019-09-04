import {
    LitElement,
    html,
    customElement,
    property,
} from "lit-element";
  
import "../components/entity/opp-state-label-badge";
import { OpenPeerPower } from '../../types';
import "@polymer/paper-card/paper-card";
import { enableWrite } from "../../common/auth/token_storage";
import "../resources/op-style";
  
@customElement("opp-store-auth-card")
  
export class OppStoreAuth extends LitElement {
  @property() public opp?: OpenPeerPower;

  static get template() {
    return html`
      <style include="op-style">
          paper-card {
            position: fixed;
            padding: 8px 0;
            bottom: 16px;
            right: 16px;
          }
  
          .card-content {
            color: var(--primary-text-color);
          }
  
          .card-actions {
            text-align: right;
            border-top: 0;
            margin-right: -4px;
          }
  
          :host(.small) paper-card {
            bottom: 0;
            left: 0;
            right: 0;
          }
        </style>
        <paper-card elevation="4">
          <div class="card-content">Do you want to save this login?</div>
          <div class="card-actions">
            <mwc-button on-click="${this._done}">No thanks</mwc-button>
            <mwc-button raised on-click="${this._save}>Save login</mwc-button>
          </div>
        </paper-card>
      `;
  }

  private _save() {
    enableWrite();
    this._done();
  }

  private _done() {
    const card = this.shadowRoot.querySelector("paper-card");
    card.style.transition = "bottom .25s";
    card.style.bottom = `-${card.offsetHeight + 8}px`;
    setTimeout(() => this.parentNode.removeChild(this), 300);
  }
}