import { MockOpenPeerPower } from "../../../src/fake_data/provide_opp";
import { Devcon } from "../../../src/panels/devcon/types";
import { DemoConfig } from "./types";

export const demoConfigs: Array<() => Promise<DemoConfig>> = [
  () =>
    import(/* webpackChunkName: "arsaboo" */ "./arsaboo").then(
      (mod) => mod.demoArsaboo
    ),
  () =>
    import(/* webpackChunkName: "teachingbirds" */ "./teachingbirds").then(
      (mod) => mod.demoTeachingbirds
    ),
  () =>
    import(/* webpackChunkName: "kernehed" */ "./kernehed").then(
      (mod) => mod.demoKernehed
    ),
  () =>
    import(/* webpackChunkName: "jimpower" */ "./jimpower").then(
      (mod) => mod.demoJimpower
    ),
];

export let selectedDemoConfigIndex: number = 0;
export let selectedDemoConfig: Promise<DemoConfig> = demoConfigs[
  selectedDemoConfigIndex
]();

export const setDemoConfig = async (
  opp: MockOpenPeerPower,
  devcon: Devcon,
  index: number
) => {
  const confProm = demoConfigs[index]();
  const config = await confProm;

  selectedDemoConfigIndex = index;
  selectedDemoConfig = confProm;

  opp.addEntities(config.entities(opp.localize), true);
  devcon.saveConfig(config.devcon(opp.localize));
  opp.mockTheme(config.theme());
};
