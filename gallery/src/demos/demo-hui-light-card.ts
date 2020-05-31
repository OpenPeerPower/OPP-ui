import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import { getEntity } from "../../../src/fake_data/entity";
import { provideOpp } from "../../../src/fake_data/provide_opp";
import "../components/demo-cards";

const ENTITIES = [
  getEntity("light", "bed_light", "on", {
    friendly_name: "Bed Light",
    brightness: 130,
  }),
];

const CONFIGS = [
  {
    heading: "Basic example",
    config: `
- type: light
  entity: light.bed_light
    `,
  },
];

class DemoLightEntity extends PolymerElement {
  static get template() {
    return html`
      <demo-cards id="demos" configs="[[_configs]]"></demo-cards>
    `;
  }

  static get properties() {
    return {
      _configs: {
        type: Object,
        value: CONFIGS,
      },
    };
  }

  public ready() {
    super.ready();
    const opp = provideOpp(this.$.demos);
    opp.addEntities(ENTITIES);
  }
}

customElements.define("demo-hui-light-card", DemoLightEntity);
