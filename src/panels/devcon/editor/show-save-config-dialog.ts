import { fireEvent } from "../../../common/dom/fire_event";
import { Devcon } from "../types";

declare global {
  // for fire event
  interface OPPDomEvents {
    "show-save-config": SaveDialogParams;
  }
}

const dialogShowEvent = "show-save-config";
const dialogTag = "hui-dialog-save-config";

export interface SaveDialogParams {
  devcon: Devcon;
}

let registeredDialog = false;

export const showSaveDialog = (
  element: HTMLElement,
  saveDialogParams: SaveDialogParams
) => {
  if (!registeredDialog) {
    registeredDialog = true;
    fireEvent(element, "register-dialog", {
      dialogShowEvent,
      dialogTag,
      dialogImport: () =>
        import(
          /* webpackChunkName: "hui-dialog-save-config" */ "./hui-dialog-save-config"
        ),
    });
  }
  fireEvent(element, dialogShowEvent, saveDialogParams);
};
