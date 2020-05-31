import {
  fetchOptionsFlow,
  handleOptionsFlowStep,
  deleteOptionsFlow,
  createOptionsFlow,
} from "../../data/options_flow";
import { html } from "lit-element";
import { localizeKey } from "../../common/translations/localize";
import {
  showFlowDialog,
  loadDataEntryFlowDialog,
} from "./show-dialog-data-entry-flow";
import { ConfigEntry } from "../../data/config_entries";

export const loadOptionsFlowDialog = loadDataEntryFlowDialog;

export const showOptionsFlowDialog = (
  element: HTMLElement,
  configEntry: ConfigEntry
): void =>
  showFlowDialog(
    element,
    {
      startFlowHandler: configEntry.entry_id,
    },
    {
      loadDevicesAndAreas: false,
      createFlow: createOptionsFlow,
      fetchFlow: fetchOptionsFlow,
      handleFlowStep: handleOptionsFlowStep,
      deleteFlow: deleteOptionsFlow,

      renderAbortDescription(opp, step) {
        const description = localizeKey(
          opp.localize,
          `component.${configEntry.domain}.options.abort.${step.reason}`,
          step.description_placeholders
        );

        return description
          ? html`
              <op-markdown allowsvg .content=${description}></op-markdown>
            `
          : "";
      },

      renderShowFormStepHeader(opp, step) {
        return (
          opp.localize(
            `component.${configEntry.domain}.options.step.${step.step_id}.title`
          ) || opp.localize(`ui.dialogs.options_flow.form.header`)
        );
      },

      renderShowFormStepDescription(opp, step) {
        const description = localizeKey(
          opp.localize,
          `component.${configEntry.domain}.options.step.${step.step_id}.description`,
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
          `component.${configEntry.domain}.options.step.${step.step_id}.data.${field.name}`
        );
      },

      renderShowFormStepFieldError(opp, _step, error) {
        return opp.localize(
          `component.${configEntry.domain}.options.error.${error}`
        );
      },

      renderExternalStepHeader(_opp, _step) {
        return "";
      },

      renderExternalStepDescription(_opp, _step) {
        return "";
      },

      renderCreateEntryDescription(opp, _step) {
        return html`
          <p>${opp.localize(`ui.dialogs.options_flow.success.description`)}</p>
        `;
      },
    }
  );
