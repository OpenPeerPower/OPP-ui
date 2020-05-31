/** Return an icon representing a sensor state. */
import { OppEntity } from "../../websocket/lib";
import { UNIT_C, UNIT_F } from "../const";
import { domainIcon } from "./domain_icon";

const fixedDeviceClassIcons = {
  humidity: "opp:water-percent",
  illuminance: "opp:brightness-5",
  temperature: "opp:thermometer",
  pressure: "opp:gauge",
  power: "opp:flash",
  signal_strength: "opp:wifi",
};

export const sensorIcon = (state: OppEntity) => {
  const dclass = state.attributes.device_class;

  if (dclass && dclass in fixedDeviceClassIcons) {
    return fixedDeviceClassIcons[dclass];
  }
  if (dclass === "battery") {
    const battery = Number(state.state);
    if (isNaN(battery)) {
      return "opp:battery-unknown";
    }
    const batteryRound = Math.round(battery / 10) * 10;
    if (batteryRound >= 100) {
      return "opp:battery";
    }
    if (batteryRound <= 0) {
      return "opp:battery-alert";
    }
    // Will return one of the following icons: (listed so extractor picks up)
    // opp:battery-10
    // opp:battery-20
    // opp:battery-30
    // opp:battery-40
    // opp:battery-50
    // opp:battery-60
    // opp:battery-70
    // opp:battery-80
    // opp:battery-90
    // We obscure 'opp' in iconname so this name does not get picked up
    return `${"opp"}:battery-${batteryRound}`;
  }

  const unit = state.attributes.unit_of_measurement;
  if (unit === UNIT_C || unit === UNIT_F) {
    return "opp:thermometer";
  }
  return domainIcon("sensor");
};
