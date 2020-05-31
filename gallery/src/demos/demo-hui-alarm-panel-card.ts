import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import { getEntity } from "../../../src/fake_data/entity";
import { provideOpp } from "../../../src/fake_data/provide_opp";
import "../components/demo-cards";

const ENTITIES = [
  getEntity("alarm_control_panel", "alarm", "disarmed", {
    friendly_name: "Alarm",
  }),
  getEntity("alarm_control_panel", "alarm_armed", "armed_home", {
    friendly_name: "Alarm",
  }),
];

const CONFIGS = [
  {
    heading: "Basic Example",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm
    `,
  },
  {
    heading: "With Title",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm_armed
  title: My Alarm
    `,
  },
  {
    heading: "Using only Arm_Home State",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm
  states:
    - arm_home
    `,
  },
  {
    heading: "Invalid Entity",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm1
    `,
  },
];

class DemoAlarmPanelEntity extends PolymerElement {
  static get template() {
    return html`
      <demo-cards id="demos" opp="[[opp]]" configs="[[_configs]]"></demo-cards>
    `;
  }

  static get properties() {
    return {
      _configs: {
        type: Object,
        value: CONFIGS,
      },
      opp: Object,
    };
  }

  public ready() {
    super.ready();
    const opp = provideOpp(this.$.demos);
    opp.addEntities(ENTITIES);
  }
}

customElements.define("demo-hui-alarm-panel-card", DemoAlarmPanelEntity);
