import { OppEntities } from "home-assistant-js-websocket";
import { GroupEntity } from "../../types";

export default function getGroupEntities(
  entities: OppEntities,
  group: GroupEntity
) {
  const result = {};

  group.attributes.entity_id.forEach((entityId) => {
    const entity = entities[entityId];

    if (entity) {
      result[entity.entity_id] = entity;
    }
  });

  return result;
}
