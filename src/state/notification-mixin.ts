import { OppBaseEl } from "./opp-base-mixin";
import { Constructor } from "../types";

export default <T extends Constructor<OppBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      // @ts-ignore
      this.registerDialog({
        dialogShowEvent: "opp-notification",
        dialogTag: "notification-manager",
        dialogImport: () =>
          import(
            /* webpackChunkName: "notification-manager" */ "../managers/notification-manager"
          ),
      });
    }
  };
