import { DemoConfig } from "../types";
import { demoDevconJimpower } from "./devcon";
import { demoEntitiesJimpower } from "./entities";
import { demoThemeJimpower } from "./theme";

export const demoJimpower: DemoConfig = {
  authorName: "Jimpower",
  authorUrl: "https://github.com/JamesMcCarthy79/Open-Peer-Power-Config",
  name: "Kingia Castle",
  devcon: demoDevconJimpower,
  entities: demoEntitiesJimpower,
  theme: demoThemeJimpower,
};
