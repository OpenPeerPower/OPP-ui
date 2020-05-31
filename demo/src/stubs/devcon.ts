import "../custom-cards/op-demo-card";
import "../custom-cards/cast-demo-row";
// Not duplicate, one is for typing.
// tslint:disable-next-line
import { HADemoCard } from "../custom-cards/op-demo-card";
import { MockOpenPeerPower } from "../../../src/fake_data/provide_opp";
import { selectedDemoConfig } from "../configs/demo-configs";
import { LocalizeFunc } from "../../../src/common/translations/localize";

export const mockDevcon = (
  opp: MockOpenPeerPower,
  localizePromise: Promise<LocalizeFunc>
) => {
  opp.mockWS("devcon/config", () =>
    Promise.all([
      selectedDemoConfig,
      localizePromise,
    ]).then(([config, localize]) => config.devcon(localize))
  );

  opp.mockWS("devcon/config/save", () => Promise.resolve());
};

customElements.whenDefined("hui-view").then(() => {
  // tslint:disable-next-line
  const HUIView = customElements.get("hui-view");
  // Patch HUI-VIEW to make the devcon object available to the demo card
  const oldCreateCard = HUIView.prototype.createCardElement;

  HUIView.prototype.createCardElement = function(config) {
    const el = oldCreateCard.call(this, config);
    if (el.tagName === "HA-DEMO-CARD") {
      (el as HADemoCard).devcon = this.devcon;
    }
    return el;
  };
});
