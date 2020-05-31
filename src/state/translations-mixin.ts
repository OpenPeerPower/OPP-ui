import { translationMetadata } from "../resources/translations-metadata";
import {
  getTranslation,
  getLocalLanguage,
  getUserLanguage,
} from "../util/opp-translation";
import { OppBaseEl } from "./opp-base-mixin";
import { computeLocalize } from "../common/translations/localize";
import { computeRTL } from "../common/util/compute_rtl";
import { OpenPeerPower, Constructor } from "../types";
import { storeState } from "../util/op-pref-storage";
import {
  getOppTranslations,
  saveTranslationPreferences,
} from "../data/translation";

/*
 * superClass needs to contain `this.opp` and `this._updateOpp`.
 */

export default <T extends Constructor<OppBaseEl>>(superClass: T) =>
  class extends superClass {
    // tslint:disable-next-line: variable-name
    private __coreProgress?: string;

    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("opp-language-select", (e) =>
        this._selectLanguage((e as CustomEvent).detail.language, true)
      );
      this._loadCoreTranslations(getLocalLanguage());
    }

    protected oppConnected() {
      super.oppConnected();
      getUserLanguage(this.opp!).then((language) => {
        if (language && this.opp!.language !== language) {
          // We just get language from backend, no need to save back
          this._selectLanguage(language, false);
        }
      });
      this._applyTranslations(this.opp!);
    }

    protected oppReconnected() {
      super.oppReconnected();
      this._applyTranslations(this.opp!);
    }

    protected panelUrlChanged(newPanelUrl) {
      super.panelUrlChanged(newPanelUrl);
      // this may be triggered before oppConnected
      this._loadFragmentTranslations(
        this.opp ? this.opp.language : getLocalLanguage(),
        newPanelUrl
      );
    }

    private _selectLanguage(language: string, saveToBackend: boolean) {
      if (!this.opp) {
        // should not happen, do it to avoid use this.opp!
        return;
      }

      // update selectedLanguage so that it can be saved to local storage
      this._updateOpp({ language, selectedLanguage: language });
      storeState(this.opp);
      if (saveToBackend) {
        saveTranslationPreferences(this.opp, { language });
      }

      this._applyTranslations(this.opp);
    }

    private _applyTranslations(opp: OpenPeerPower) {
      this.style.direction = computeRTL(opp) ? "rtl" : "ltr";
      this._loadCoreTranslations(opp.language);
      this._loadOppTranslations(opp.language);
      this._loadFragmentTranslations(opp.language, opp.panelUrl);
    }

    private async _loadOppTranslations(language: string) {
      const resources = await getOppTranslations(this.opp!, language);

      // Ignore the repsonse if user switched languages before we got response
      if (this.opp!.language !== language) {
        return;
      }

      this._updateResources(language, resources);
    }

    private async _loadFragmentTranslations(
      language: string,
      panelUrl: string
    ) {
      if (translationMetadata.fragments.includes(panelUrl)) {
        const result = await getTranslation(panelUrl, language);
        this._updateResources(result.language, result.data);
      }
    }

    private async _loadCoreTranslations(language: string) {
      // Check if already in progress
      // Necessary as we call this in firstUpdated and oppConnected
      if (this.__coreProgress === language) {
        return;
      }
      this.__coreProgress = language;
      try {
        const result = await getTranslation(null, language);
        this._updateResources(result.language, result.data);
      } finally {
        this.__coreProgress = undefined;
      }
    }

    private _updateResources(language: string, data: any) {
      // Update the language in opp, and update the resources with the newly
      // loaded resources. This merges the new data on top of the old data for
      // this language, so that the full translation set can be loaded across
      // multiple fragments.
      const resources = {
        [language]: {
          ...(this.opp && this.opp.resources && this.opp.resources[language]),
          ...data,
        },
      };
      const changes: Partial<OpenPeerPower> = { resources };
      if (this.opp && language === this.opp.language) {
        changes.localize = computeLocalize(this, language, resources);
      }
      this._updateOpp(changes);
    }
  };
