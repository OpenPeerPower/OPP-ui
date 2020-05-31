import {
  LitElement,
  html,
  TemplateResult,
  property,
  customElement,
} from "lit-element";
import { OppEntity } from "../../../websocket/lib";

import { OpenPeerPower } from "../../../types";

import "../../../components/op-attributes";

@customElement("more-info-default")
class MoreInfoDefault extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public stateObj?: OppEntity;

  protected render(): TemplateResult {
    if (!this.opp || !this.stateObj) {
      return html``;
    }

    return html`
      <op-attributes .stateObj=${this.stateObj}></op-attributes>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-default": MoreInfoDefault;
  }
}
