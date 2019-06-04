import computeDomain from "./compute_domain";
import { OppEntities } from "home-assistant-js-websocket";
import { GroupEntity } from "../../types";

// Split a collection into a list of groups and a 'rest' list of ungrouped
// entities.
// Returns { groups: [], ungrouped: {} }
export default function splitByGroups(entities: OppEntities) {
  const groups: GroupEntity[] = [];
  const ungrouped: OppEntities = {};

  Object.keys(entities).forEach((entityId) => {
    const entity = entities[entityId];

    if (computeDomain(entityId) === "group") {
      groups.push(entity as GroupEntity);
    } else {
      ungrouped[entityId] = entity;
    }
  });

  groups.forEach((group) =>
    group.attributes.entity_id.forEach((entityId) => {
      delete ungrouped[entityId];
    })
  );

  return { groups, ungrouped };
}
