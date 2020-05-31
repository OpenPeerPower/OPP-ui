import { OPPDomEvent } from "../common/dom/fire_event";
import { OppBaseEl } from "./opp-base-mixin";
import { makeDialogManager, showDialog } from "../dialogs/make-dialog-manager";
import { Constructor } from "../types";

interface RegisterDialogParams {
  dialogShowEvent: keyof OPPDomEvents;
  dialogTag: keyof HTMLElementTagNameMap;
  dialogImport: () => Promise<unknown>;
}

declare global {
  // for fire event
  interface OPPDomEvents {
    "register-dialog": RegisterDialogParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "register-dialog": OPPDomEvent<RegisterDialogParams>;
  }
}

export const dialogManagerMixin = <T extends Constructor<OppBaseEl>>(
  superClass: T
) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      // deprecated
      this.addEventListener("register-dialog", (e) =>
        this.registerDialog(e.detail)
      );
      makeDialogManager(this, this.shadowRoot!);
    }

    private registerDialog({
      dialogShowEvent,
      dialogTag,
      dialogImport,
    }: RegisterDialogParams) {
      this.addEventListener(dialogShowEvent, (showEv) => {
        showDialog(
          this,
          this.shadowRoot!,
          dialogImport,
          dialogTag,
          (showEv as OPPDomEvent<unknown>).detail
        );
      });
    }
  };
