import { Devcon } from "../types";
import { deleteCard } from "./config-util";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../dialogs/generic/show-dialog-box";
import { OpenPeerPower } from "../../../types";

export async function confDeleteCard(
  element: HTMLElement,
  opp: OpenPeerPower,
  devcon: Devcon,
  path: [number, number]
): Promise<void> {
  showConfirmationDialog(element, {
    text: opp.localize("ui.panel.devcon.cards.confirm_delete"),
    confirm: async () => {
      try {
        await devcon.saveConfig(deleteCard(devcon.config, path));
      } catch (err) {
        showAlertDialog(element, {
          text: `Deleting failed: ${err.message}`,
        });
      }
    },
  });
}
