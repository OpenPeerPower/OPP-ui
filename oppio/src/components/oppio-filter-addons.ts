import { OppioAddonInfo } from "../../../src/data/oppio/addon";
import * as Fuse from "fuse.js";

export function filterAndSort(addons: OppioAddonInfo[], filter: string) {
  const options: Fuse.FuseOptions<OppioAddonInfo> = {
    keys: ["name", "description", "slug"],
    caseSensitive: false,
    minMatchCharLength: 2,
    threshold: 0.2,
  };
  const fuse = new Fuse(addons, options);
  return fuse.search(filter);
}
