import { DevconCardConfig } from "../../../data/devcon";
import { Condition } from "../common/validate-condition";
import { DevconElementConfig } from "../elements/types";

export interface ConditionalBaseConfig extends DevconCardConfig {
  card: DevconCardConfig | DevconElementConfig;
  conditions: Condition[];
}
