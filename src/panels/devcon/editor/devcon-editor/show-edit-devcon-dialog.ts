import { fireEvent } from "../../../../common/dom/fire_event";
import { Devcon } from "../../types";

declare global {
  // for fire event
  interface OPPDomEvents {
    "show-edit-devcon": Devcon;
  }
}

let registeredDialog = false;
const dialogShowEvent = "show-edit-devcon";
const dialogTag = "hui-dialog-edit-devcon";

const registerEditDevconDialog = (element: HTMLElement): Event =>
  fireEvent(element, "register-dialog", {
    dialogShowEvent,
    dialogTag,
    dialogImport: () =>
      import(
        /* webpackChunkName: "hui-dialog-edit-devcon" */ "./hui-dialog-edit-devcon"
      ),
  });

export const showEditDevconDialog = (
  element: HTMLElement,
  devcon: Devcon
): void => {
  if (!registeredDialog) {
    registeredDialog = true;
    registerEditDevconDialog(element);
  }
  fireEvent(element, dialogShowEvent, devcon);
};
