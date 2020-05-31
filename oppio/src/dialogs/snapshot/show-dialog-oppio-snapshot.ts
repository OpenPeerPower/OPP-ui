import { fireEvent } from "../../../../src/common/dom/fire_event";

export interface OppioSnapshotDialogParams {
  slug: string;
  onDelete: () => void;
}

export const showOppioSnapshotDialog = (
  element: HTMLElement,
  dialogParams: OppioSnapshotDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-oppio-snapshot",
    dialogImport: () =>
      import(
        /* webpackChunkName: "dialog-oppio-snapshot" */ "./dialog-oppio-snapshot"
      ),
    dialogParams,
  });
};
