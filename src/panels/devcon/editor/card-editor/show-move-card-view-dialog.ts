import { fireEvent } from "../../../../common/dom/fire_event";
import { Devcon } from "../../types";

declare global {
  // for fire event
  interface OPPDomEvents {
    "show-move-card-view": MoveCardViewDialogParams;
  }
}

let registeredDialog = false;

export interface MoveCardViewDialogParams {
  path: [number, number];
  devcon: Devcon;
}

const registerEditCardDialog = (element: HTMLElement): Event =>
  fireEvent(element, "register-dialog", {
    dialogShowEvent: "show-move-card-view",
    dialogTag: "hui-dialog-move-card-view",
    dialogImport: () =>
      import(
        /* webpackChunkName: "hui-dialog-move-card-view" */ "./hui-dialog-move-card-view"
      ),
  });

export const showMoveCardViewDialog = (
  element: HTMLElement,
  moveCardViewDialogParams: MoveCardViewDialogParams
): void => {
  if (!registeredDialog) {
    registeredDialog = true;
    registerEditCardDialog(element);
  }
  fireEvent(element, "show-move-card-view", moveCardViewDialogParams);
};
