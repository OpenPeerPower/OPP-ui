import { fireEvent } from "../../common/dom/fire_event";

export interface OpDomainTogglerDialogParams {
  domains: string[];
  toggleDomain: (domain: string, turnOn: boolean) => void;
}

export const loadDomainTogglerDialog = () =>
  import(
    /* webpackChunkName: "dialog-domain-toggler" */ "./dialog-domain-toggler"
  );

export const showDomainTogglerDialog = (
  element: HTMLElement,
  dialogParams: OpDomainTogglerDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-domain-toggler",
    dialogImport: loadDomainTogglerDialog,
    dialogParams,
  });
};
