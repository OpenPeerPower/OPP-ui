import { fireEvent } from "../../../../common/dom/fire_event";
import { DevconConfig, DevconCardConfig } from "../../../../data/devcon";

export interface SuggestCardDialogParams {
  devconConfig?: DevconConfig;
  saveConfig?: (config: DevconConfig) => void;
  path?: [number];
  entities: string[]; // We can pass entity id's that will be added to the config when a card is picked
  cardConfig?: DevconCardConfig[]; // We can pass a suggested config
}

const importsuggestCardDialog = () =>
  import(
    /* webpackChunkName: "hui-dialog-suggest-card" */ "./hui-dialog-suggest-card"
  );

export const showSuggestCardDialog = (
  element: HTMLElement,
  suggestCardDialogParams: SuggestCardDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "hui-dialog-suggest-card",
    dialogImport: importsuggestCardDialog,
    dialogParams: suggestCardDialogParams,
  });
};
