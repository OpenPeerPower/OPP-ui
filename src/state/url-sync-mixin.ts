import { OppBaseEl } from "./opp-base-mixin";
import { fireEvent } from "../common/dom/fire_event";
import { Constructor } from "../types";

/* tslint:disable:no-console */
const DEBUG = false;

export const urlSyncMixin = <T extends Constructor<OppBaseEl>>(superClass: T) =>
  // Disable this functionality in the demo.
  __DEMO__
    ? superClass
    : class extends superClass {
        private _ignoreNextOppChange = false;
        private _ignoreNextPopstate = false;
        private _moreInfoOpenedFromPath?: string;

        public connectedCallback(): void {
          super.connectedCallback();
          window.addEventListener("popstate", this._popstateChangeListener);
        }

        public disconnectedCallback(): void {
          super.disconnectedCallback();
          window.removeEventListener("popstate", this._popstateChangeListener);
        }

        protected oppChanged(newOpp, oldOpp): void {
          super.oppChanged(newOpp, oldOpp);

          if (this._ignoreNextOppChange) {
            if (DEBUG) {
              console.log("ignore oppchange");
            }
            this._ignoreNextOppChange = false;
            return;
          }
          if (!oldOpp || oldOpp.moreInfoEntityId === newOpp.moreInfoEntityId) {
            if (DEBUG) {
              console.log("ignoring opp change");
            }
            return;
          }

          if (newOpp.moreInfoEntityId) {
            if (DEBUG) {
              console.log("pushing state");
            }
            // We keep track of where we opened moreInfo from so that we don't
            // pop the state when we close the modal if the modal has navigated
            // us away.
            this._moreInfoOpenedFromPath = window.location.pathname;
            history.pushState(null, "", window.location.pathname);
          } else if (
            window.location.pathname === this._moreInfoOpenedFromPath
          ) {
            if (DEBUG) {
              console.log("history back");
            }
            this._ignoreNextPopstate = true;
            history.back();
          }
        }

        private _popstateChangeListener = (ev) => {
          if (this._ignoreNextPopstate) {
            if (DEBUG) {
              console.log("ignore popstate");
            }
            this._ignoreNextPopstate = false;
            return;
          }

          if (DEBUG) {
            console.log("popstate", ev);
          }

          if (this.opp && this.opp.moreInfoEntityId) {
            if (DEBUG) {
              console.log("deselect entity");
            }
            this._ignoreNextOppChange = true;
            fireEvent(this, "opp-more-info", { entityId: null });
          }
        };
      };
