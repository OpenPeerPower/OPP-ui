import { OppElement } from "../state/opp-element";
import { showToast } from "./toast";

export const registerServiceWorker = (notifyUpdate = true) => {
  if (
    !("serviceWorker" in navigator) ||
    (location.protocol !== "https:" && location.hostname !== "localhost")
  ) {
    return;
  }

  navigator.serviceWorker.register("/service_worker.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const installingWorker = reg.installing;
      if (!installingWorker || !notifyUpdate) {
        return;
      }
      installingWorker.addEventListener("statechange", () => {
        if (
          installingWorker.state === "installed" &&
          navigator.serviceWorker.controller &&
          !__DEV__ &&
          !__DEMO__
        ) {
          // Notify users here of a new frontend being available.
          const haElement = window.document.querySelector(
            "open-peer-power, op-onboarding"
          )! as OppElement;
          showToast(haElement, {
            message: "A new version of the frontend is available.",
            action: {
              action: () =>
                installingWorker.postMessage({ type: "skipWaiting" }),
              text: "reload",
            },
            duration: 0,
            dismissable: false,
          });
        }
      });
    });
  });

  // If the active service worker changes, refresh the page because the cache has changed
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    location.reload();
  });
};
