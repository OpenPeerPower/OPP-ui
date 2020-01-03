import { h, Component } from "preact";
import "@polymer/paper-radio-button/paper-radio-button";
import "@polymer/paper-radio-group/paper-radio-group";

export default class OppTrigger extends Component {
  constructor() {
    super();

    this.radioGroupPicked = this.radioGroupPicked.bind(this);
  }

  radioGroupPicked(ev) {
    this.props.onChange(
      this.props.index,
      Object.assign({}, this.props.trigger, { event: ev.target.selected })
    );
  }

  /* eslint-disable camelcase */
  render({ trigger, localize }) {
    const { event } = trigger;
    return (
      <div>
        <label id="eventlabel">
          {localize(
            "ui.panel.config.automation.editor.triggers.type.openpeerpower.event"
          )}
        </label>
        <paper-radio-group
          selected={event}
          aria-labelledby="eventlabel"
          onpaper-radio-group-changed={this.radioGroupPicked}
        >
          <paper-radio-button name="start">
            {localize(
              "ui.panel.config.automation.editor.triggers.type.openpeerpower.start"
            )}
          </paper-radio-button>
          <paper-radio-button name="shutdown">
            {localize(
              "ui.panel.config.automation.editor.triggers.type.openpeerpower.shutdown"
            )}
          </paper-radio-button>
        </paper-radio-group>
      </div>
    );
  }
}

OppTrigger.defaultConfig = {
  event: "start",
};