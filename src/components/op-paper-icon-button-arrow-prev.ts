import "@polymer/paper-icon-button/paper-icon-button";
import { Constructor } from "../types";
// Not duplicate, this is for typing.
// tslint:disable-next-line
import { PaperIconButtonElement } from "@polymer/paper-icon-button/paper-icon-button";

const paperIconButtonClass = customElements.get(
  "paper-icon-button"
) as Constructor<PaperIconButtonElement>;

export class OpPaperIconButtonArrowPrev extends paperIconButtonClass {
  public oppio?: boolean;

  public connectedCallback() {
    super.connectedCallback();

    // wait to check for direction since otherwise direction is wrong even though top level is RTL
    setTimeout(() => {
      this.icon =
        window.getComputedStyle(this).direction === "ltr"
          ? this.oppio
            ? "oppio:arrow-left"
            : "opp:arrow-left"
          : this.oppio
          ? "oppio:arrow-right"
          : "opp:arrow-right";
    }, 100);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-paper-icon-button-arrow-prev": OpPaperIconButtonArrowPrev;
  }
}

customElements.define(
  "op-paper-icon-button-arrow-prev",
  OpPaperIconButtonArrowPrev
);
