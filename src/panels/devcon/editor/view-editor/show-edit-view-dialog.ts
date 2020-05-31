import { OPPDomEvent, fireEvent } from "../../../../common/dom/fire_event";
import { Devcon } from "../../types";

declare global {
  // for fire event
  interface OPPDomEvents {
    "reload-devcon": undefined;
    "show-edit-view": EditViewDialogParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "reload-devcon": OPPDomEvent<undefined>;
  }
}

let registeredDialog = false;
const dialogShowEvent = "show-edit-view";
const dialogTag = "hui-dialog-edit-view";

export interface EditViewDialogParams {
  devcon: Devcon;
  viewIndex?: number;
}

const registerEditViewDialog = (element: HTMLElement): Event =>
  fireEvent(element, "register-dialog", {
    dialogShowEvent,
    dialogTag,
    dialogImport: () =>
      import(
        /* webpackChunkName: "hui-dialog-edit-view" */ "./hui-dialog-edit-view"
      ),
  });

export const showEditViewDialog = (
  element: HTMLElement,
  editViewDialogParams: EditViewDialogParams
): void => {
  if (!registeredDialog) {
    registeredDialog = true;
    registerEditViewDialog(element);
  }
  fireEvent(element, dialogShowEvent, editViewDialogParams);
};
