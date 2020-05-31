import { DevconConfig } from "../../../src/data/devcon";
import { Entity } from "../../../src/fake_data/entity";
import { LocalizeFunc } from "../../../src/common/translations/localize";

export interface DemoConfig {
  index?: number;
  name: string;
  authorName: string;
  authorUrl: string;
  devcon: (localize: LocalizeFunc) => DevconConfig;
  entities: (localize: LocalizeFunc) => Entity[];
  theme: () => { [key: string]: string } | null;
}
