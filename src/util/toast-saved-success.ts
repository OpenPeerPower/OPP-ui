import { showToast } from "./toast";
import { OpenPeerPower } from "../types";

export const showSaveSuccessToast = (el: HTMLElement, opp: OpenPeerPower) =>
  showToast(el, {
    message: opp!.localize("ui.common.successfully_saved"),
  });
