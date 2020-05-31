import { DemoConfig } from "../types";
import { demoDevconArsaboo } from "./devcon";
import { demoEntitiesArsaboo } from "./entities";
import { demoThemeArsaboo } from "./theme";

export const demoArsaboo: DemoConfig = {
  authorName: "Arsaboo",
  authorUrl: "https://github.com/arsaboo/openpeerpower-config/",
  name: "ARS Home",
  devcon: demoDevconArsaboo,
  entities: demoEntitiesArsaboo,
  theme: demoThemeArsaboo,
};
