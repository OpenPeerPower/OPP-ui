import { DemoConfig } from "../types";
import { demoDevconKernehed } from "./devcon";
import { demoEntitiesKernehed } from "./entities";
import { demoThemeKernehed } from "./theme";

export const demoKernehed: DemoConfig = {
  authorName: "Kernehed",
  authorUrl: "https://github.com/kernehed",
  name: "Hem",
  devcon: demoDevconKernehed,
  entities: demoEntitiesKernehed,
  theme: demoThemeKernehed,
};
