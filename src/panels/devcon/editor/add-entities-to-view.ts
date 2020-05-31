import { OpenPeerPower } from "../../../types";
import { DevconConfig, fetchConfig, saveConfig } from "../../../data/devcon";
import { showSelectViewDialog } from "./select-view/show-select-view-dialog";
import { showSuggestCardDialog } from "./card-editor/show-suggest-card-dialog";

export const addEntitiesToDevconView = async (
  element: HTMLElement,
  opp: OpenPeerPower,
  entities: string[],
  devconConfig?: DevconConfig,
  saveConfigFunc?: (newConfig: DevconConfig) => void
) => {
  if ((opp!.panels.devcon?.config as any)?.mode === "yaml") {
    showSuggestCardDialog(element, {
      entities,
    });
    return;
  }
  if (!devconConfig) {
    try {
      devconConfig = await fetchConfig(opp.connection, false);
    } catch {
      alert(
        opp.localize(
          "ui.panel.devcon.editor.add_entities.generated_unsupported"
        )
      );
      return;
    }
  }
  if (!devconConfig.views.length) {
    alert("You don't have any Devcon views, first create a view in Devcon.");
    return;
  }
  if (!saveConfigFunc) {
    saveConfigFunc = async (newConfig: DevconConfig): Promise<void> => {
      try {
        await saveConfig(opp!, newConfig);
      } catch {
        alert(
          opp.localize("ui.panel.config.devices.add_entities.saving_failed")
        );
      }
    };
  }
  if (devconConfig.views.length === 1) {
    showSuggestCardDialog(element, {
      devconConfig: devconConfig!,
      saveConfig: saveConfigFunc,
      path: [0],
      entities,
    });
    return;
  }
  showSelectViewDialog(element, {
    devconConfig,
    viewSelectedCallback: (view) => {
      showSuggestCardDialog(element, {
        devconConfig: devconConfig!,
        saveConfig: saveConfigFunc,
        path: [view],
        entities,
      });
    },
  });
};
