import { fireEvent } from "../../../../common/dom/fire_event";
import { DevconConfig } from "../../../../data/devcon";

export interface EditCardDialogParams {
  devconConfig: DevconConfig;
  saveConfig: (config: DevconConfig) => void;
  path: [number] | [number, number];
  entities?: string[]; // We can pass entity id's that will be added to the config when a card is picked
}

const importEditCardDialog = () =>
  import(
    /* webpackChunkName: "hui-dialog-edit-card" */ "./hui-dialog-edit-card"
  );

export const showEditCardDialog = (
  element: HTMLElement,
  editCardDialogParams: EditCardDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "hui-dialog-edit-card",
    dialogImport: importEditCardDialog,
    dialogParams: editCardDialogParams,
  });
};
