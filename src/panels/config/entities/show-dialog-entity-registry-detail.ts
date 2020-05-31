import { fireEvent } from "../../../common/dom/fire_event";
import { EntityRegistryEntry } from "../../../data/entity_registry";
import { DialogEntityRegistryDetail } from "./dialog-entity-registry-detail";

export interface EntityRegistryDetailDialogParams {
  entry?: EntityRegistryEntry;
  entity_id: string;
}

export const loadEntityRegistryDetailDialog = () =>
  import(
    /* webpackChunkName: "entity-registry-detail-dialog" */ "./dialog-entity-registry-detail"
  );

const getDialog = () => {
  return document
    .querySelector("open-peer-power")!
    .shadowRoot!.querySelector("dialog-entity-registry-detail") as
    | DialogEntityRegistryDetail
    | undefined;
};

export const showEntityRegistryDetailDialog = (
  element: HTMLElement,
  entityDetailParams: EntityRegistryDetailDialogParams
): (() => DialogEntityRegistryDetail | undefined) => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-entity-registry-detail",
    dialogImport: loadEntityRegistryDetailDialog,
    dialogParams: entityDetailParams,
  });
  return getDialog;
};
