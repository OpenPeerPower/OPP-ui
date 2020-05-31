import "@polymer/iron-icon/iron-icon";
// Not duplicate, this is for typing.
// tslint:disable-next-line
import { OpIcon } from "./op-icon";

export class OpIconNext extends OpIcon {
  public connectedCallback() {
    super.connectedCallback();

    // wait to check for direction since otherwise direction is wrong even though top level is RTL
    setTimeout(() => {
      this.icon =
        window.getComputedStyle(this).direction === "ltr"
          ? "opp:chevron-right"
          : "opp:chevron-left";
    }, 100);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-icon-next": OpIconNext;
  }
}

customElements.define("op-icon-next", OpIconNext);
