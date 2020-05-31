import { OpenPeerPowerAppEl } from "../../src/layouts/open-peer-power";
import { provideOpp, MockOpenPeerPower } from "../../src/fake_data/provide_opp";
import { navigate } from "../../src/common/navigate";
import { mockDevcon } from "./stubs/devcon";
import { mockAuth } from "./stubs/auth";
import { selectedDemoConfig } from "./configs/demo-configs";
import { mockTranslations } from "./stubs/translations";
import { mockHistory } from "./stubs/history";
import { mockShoppingList } from "./stubs/shopping_list";
import { mockSystemLog } from "./stubs/system_log";
import { mockTemplate } from "./stubs/template";
import { mockEvents } from "./stubs/events";
import { mockMediaPlayer } from "./stubs/media_player";
import { OpenPeerPower } from "../../src/types";
import { mockFrontend } from "./stubs/frontend";
import { mockPersistentNotification } from "./stubs/persistent_notification";
import { isNavigationClick } from "../../src/common/dom/is-navigation-click";

class OpDemo extends OpenPeerPowerAppEl {
  protected async _initialize() {
    const initial: Partial<MockOpenPeerPower> = {
      panelUrl: (this as any).panelUrl,
      // Override updateOpp so that the correct opp lifecycle methods are called
      updateOpp: (oppUpdate: Partial<OpenPeerPower>) =>
        this._updateOpp(oppUpdate),
    };

    const opp = (this.opp = provideOpp(this, initial));
    const localizePromise =
      // @ts-ignore
      this._loadFragmentTranslations(opp.language, "page-demo").then(
        () => this.opp!.localize
      );

    mockDevcon(opp, localizePromise);
    mockAuth(opp);
    mockTranslations(opp);
    mockHistory(opp);
    mockShoppingList(opp);
    mockSystemLog(opp);
    mockTemplate(opp);
    mockEvents(opp);
    mockMediaPlayer(opp);
    mockFrontend(opp);
    mockPersistentNotification(opp);

    // Once config is loaded AND localize, set entities and apply theme.
    Promise.all([selectedDemoConfig, localizePromise]).then(
      ([conf, localize]) => {
        opp.addEntities(conf.entities(localize));
        if (conf.theme) {
          opp.mockTheme(conf.theme());
        }
      }
    );

    // Taken from polymer/pwa-helpers. BSD-3 licensed
    document.body.addEventListener(
      "click",
      (e) => {
        const href = isNavigationClick(e);

        if (!href) {
          return;
        }

        e.preventDefault();
        navigate(this, href);
      },
      { capture: true }
    );

    (this as any).oppConnected();
  }
}

customElements.define("op-demo", OpDemo);
