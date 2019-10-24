/**
 * Lite base mixin to add localization without depending on the Opp object.
 */

/**
 * @polymerMixin
 */
export const localizeLiteBaseMixin = (superClass) =>
  class extends superClass {
    protected _initializeLocalizeLite() {
      if (this.resources) {
        return;
      }

      if (!this.translationFragment) {
        // In dev mode, we will issue a warning if after a second we are still
        // not configured correctly.
        if (__DEV__) {
          setTimeout(
            () =>
              !this.resources &&
              // tslint:disable-next-line
              console.error(
                "Forgot to pass in resources or set translationFragment for",
                this.nodeName
              ),
            1000
          );
        }
        return;
      }

      this._downloadResources();
    }

  };
