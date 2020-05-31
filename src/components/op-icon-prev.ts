import "@polymer/iron-icon/iron-icon";
// Not duplicate, this is for typing.
// tslint:disable-next-line
import { OpIcon } from "./op-icon";

export class OpIconPrev extends OpIcon {
  public connectedCallback() {
    super.connectedCallback();

    // wait to check for direction since otherwise direction is wrong even though top level is RTL
    setTimeout(() => {
      this.icon =
        window.getComputedStyle(this).direction === "ltr"
          ? "opp:chevron-left"
          : "opp:chevron-right";
    }, 100);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-icon-prev": OpIconPrev;
  }
}

customElements.define("op-icon-prev", OpIconPrev);
