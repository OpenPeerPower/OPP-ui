import { Component } from "preact";
import "@polymer/paper-input/paper-input";
import { onChangeEvent } from "../../../../common/preact/event";
export default class TimeCondition extends Component {
    constructor() {
        super();
        this.onChange = onChangeEvent.bind(this, "condition");
    }
    /* eslint-disable camelcase */
    render({ condition }) {
        const { after, before } = condition;
        return -input;
        label = {
            "ui.panel.config.automation.editor.conditions.type.time.after": 
        };
        name = "after";
        value = { after };
        onvalue - changed;
        {
            this.onChange;
        }
        />
            < paper - input;
        label = {
            "ui.panel.config.automation.editor.conditions.type.time.before": 
        };
        name = "before";
        value = { before };
        onvalue - changed;
        {
            this.onChange;
        }
        />
            < /div>;
        ;
    }
}
TimeCondition.defaultConfig = {};
//# sourceMappingURL=time.js.map