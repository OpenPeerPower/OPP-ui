import { LitElement, html } from "lit-element";

import "./op-progress-button";
import { fireEvent } from "../../common/dom/fire_event";

class OpCallApiButton extends LitElement {
  render() {
    return html`
      <op-progress-button
        .progress="${this.progress}"
        @click="${this._buttonTapped}"
        ?disabled="${this.disabled}"
        ><slot></slot
      ></op-progress-button>
    `;
  }

  constructor() {
    super();
    this.method = "POST";
    this.data = {};
    this.disabled = false;
    this.progress = false;
  }

  static get properties() {
    return {
      opp: {},
      progress: Boolean,
      path: String,
      method: String,
      data: {},
      disabled: Boolean,
    };
  }

  get progressButton() {
    return this.renderRoot.querySelector("op-progress-button");
  }

  async _buttonTapped() {
    this.progress = true;
    const eventData = {
      method: this.method,
      path: this.path,
      data: this.data,
    };

    try {
      const resp = await this.opp.callApi(this.method, this.path, this.data);
      this.progress = false;
      this.progressButton.actionSuccess();
      eventData.success = true;
      eventData.response = resp;
    } catch (err) {
      this.progress = false;
      this.progressButton.actionError();
      eventData.success = false;
      eventData.response = err;
    }

    fireEvent(this, "opp-api-called", eventData);
  }
}

customElements.define("op-call-api-button", OpCallApiButton);
