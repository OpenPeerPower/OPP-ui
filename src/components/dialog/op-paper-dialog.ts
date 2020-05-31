import "@polymer/paper-dialog/paper-dialog";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class";
import { OpIronFocusablesHelper } from "./op-iron-focusables-helper.js";
// tslint:disable-next-line
import { PaperDialogElement } from "@polymer/paper-dialog/paper-dialog";

const paperDialogClass = customElements.get("paper-dialog");

// behavior that will override existing iron-overlay-behavior and call the fixed implementation
const haTabFixBehaviorImpl = {
  get _focusableNodes() {
    return OpIronFocusablesHelper.getTabbableNodes(this);
  },
};

// paper-dialog that uses the haTabFixBehaviorImpl behvaior
// export class OpPaperDialog extends paperDialogClass {}
// @ts-ignore
export class OpPaperDialog
  extends mixinBehaviors([haTabFixBehaviorImpl], paperDialogClass)
  implements PaperDialogElement {}

declare global {
  interface HTMLElementTagNameMap {
    "op-paper-dialog": OpPaperDialog;
  }
}
customElements.define("op-paper-dialog", OpPaperDialog);
