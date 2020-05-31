import { TemplateResult } from "lit-html";
import { fireEvent } from "../../common/dom/fire_event";
import { OpenPeerPower } from "../../types";
import {
  DataEntryFlowStepCreateEntry,
  DataEntryFlowStepExternal,
  DataEntryFlowStepForm,
  DataEntryFlowStep,
  DataEntryFlowStepAbort,
} from "../../data/data_entry_flow";
import { OpFormSchema } from "../../components/op-form/op-form";

export interface FlowConfig {
  loadDevicesAndAreas: boolean;

  getFlowHandlers?: (opp: OpenPeerPower) => Promise<string[]>;

  createFlow(opp: OpenPeerPower, handler: string): Promise<DataEntryFlowStep>;

  fetchFlow(opp: OpenPeerPower, flowId: string): Promise<DataEntryFlowStep>;

  handleFlowStep(
    opp: OpenPeerPower,
    flowId: string,
    data: { [key: string]: any }
  ): Promise<DataEntryFlowStep>;

  deleteFlow(opp: OpenPeerPower, flowId: string): Promise<unknown>;

  renderAbortDescription(
    opp: OpenPeerPower,
    step: DataEntryFlowStepAbort
  ): TemplateResult | "";

  renderShowFormStepHeader(
    opp: OpenPeerPower,
    step: DataEntryFlowStepForm
  ): string;

  renderShowFormStepDescription(
    opp: OpenPeerPower,
    step: DataEntryFlowStepForm
  ): TemplateResult | "";

  renderShowFormStepFieldLabel(
    opp: OpenPeerPower,
    step: DataEntryFlowStepForm,
    field: OpFormSchema
  ): string;

  renderShowFormStepFieldError(
    opp: OpenPeerPower,
    step: DataEntryFlowStepForm,
    error: string
  ): string;

  renderExternalStepHeader(
    opp: OpenPeerPower,
    step: DataEntryFlowStepExternal
  ): string;

  renderExternalStepDescription(
    opp: OpenPeerPower,
    step: DataEntryFlowStepExternal
  ): TemplateResult | "";

  renderCreateEntryDescription(
    opp: OpenPeerPower,
    step: DataEntryFlowStepCreateEntry
  ): TemplateResult | "";
}

export interface DataEntryFlowDialogParams {
  startFlowHandler?: string;
  continueFlowId?: string;
  dialogClosedCallback?: (params: { flowFinished: boolean }) => void;
  flowConfig: FlowConfig;
  showAdvanced?: boolean;
}

export const loadDataEntryFlowDialog = () =>
  import(
    /* webpackChunkName: "dialog-config-flow" */ "./dialog-data-entry-flow"
  );

export const showFlowDialog = (
  element: HTMLElement,
  dialogParams: Omit<DataEntryFlowDialogParams, "flowConfig">,
  flowConfig: FlowConfig
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-data-entry-flow",
    dialogImport: loadDataEntryFlowDialog,
    dialogParams: {
      ...dialogParams,
      flowConfig,
    },
  });
};
