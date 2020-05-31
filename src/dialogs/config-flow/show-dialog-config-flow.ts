import {
  getConfigFlowHandlers,
  fetchConfigFlow,
  handleConfigFlowStep,
  deleteConfigFlow,
  createConfigFlow,
} from "../../data/config_flow";
import { html } from "lit-element";
import { localizeKey } from "../../common/translations/localize";
import {
  showFlowDialog,
  DataEntryFlowDialogParams,
  loadDataEntryFlowDialog,
} from "./show-dialog-data-entry-flow";
import { caseInsensitiveCompare } from "../../common/string/compare";

export const loadConfigFlowDialog = loadDataEntryFlowDialog;

export const showConfigFlowDialog = (
  element: HTMLElement,
  dialogParams: Omit<DataEntryFlowDialogParams, "flowConfig">
): void =>
  showFlowDialog(element, dialogParams, {
    loadDevicesAndAreas: true,
    getFlowHandlers: (opp) =>
      getConfigFlowHandlers(opp).then((handlers) =>
        handlers.sort((handlerA, handlerB) =>
          caseInsensitiveCompare(
            opp.localize(`component.${handlerA}.config.title`),
            opp.localize(`component.${handlerB}.config.title`)
          )
        )
      ),
    createFlow: createConfigFlow,
    fetchFlow: fetchConfigFlow,
    handleFlowStep: handleConfigFlowStep,
    deleteFlow: deleteConfigFlow,

    renderAbortDescription(opp, step) {
      const description = localizeKey(
        opp.localize,
        `component.${step.handler}.config.abort.${step.reason}`,
        step.description_placeholders
      );

      return description
        ? html`
            <op-markdown allowsvg .content=${description}></op-markdown>
          `
        : "";
    },

    renderShowFormStepHeader(opp, step) {
      return opp.localize(
        `component.${step.handler}.config.step.${step.step_id}.title`
      );
    },

    renderShowFormStepDescription(opp, step) {
      const description = localizeKey(
        opp.localize,
        `component.${step.handler}.config.step.${step.step_id}.description`,
        step.description_placeholders
      );
      return description
        ? html`
            <op-markdown allowsvg .content=${description}></op-markdown>
          `
        : "";
    },

    renderShowFormStepFieldLabel(opp, step, field) {
      return opp.localize(
        `component.${step.handler}.config.step.${step.step_id}.data.${field.name}`
      );
    },

    renderShowFormStepFieldError(opp, step, error) {
      return opp.localize(`component.${step.handler}.config.error.${error}`);
    },

    renderExternalStepHeader(opp, step) {
      return opp.localize(
        `component.${step.handler}.config.step.${step.step_id}.title`
      );
    },

    renderExternalStepDescription(opp, step) {
      const description = localizeKey(
        opp.localize,
        `component.${step.handler}.config.${step.step_id}.description`,
        step.description_placeholders
      );

      return html`
        <p>
          ${opp.localize(
            "ui.panel.config.integrations.config_flow.external_step.description"
          )}
        </p>
        ${description
          ? html`
              <op-markdown allowsvg .content=${description}></op-markdown>
            `
          : ""}
      `;
    },

    renderCreateEntryDescription(opp, step) {
      const description = localizeKey(
        opp.localize,
        `component.${step.handler}.config.create_entry.${step.description ||
          "default"}`,
        step.description_placeholders
      );

      return html`
        ${description
          ? html`
              <op-markdown allowsvg .content=${description}></op-markdown>
            `
          : ""}
        <p>
          ${opp.localize(
            "ui.panel.config.integrations.config_flow.created_config",
            "name",
            step.title
          )}
        </p>
      `;
    },
  });
