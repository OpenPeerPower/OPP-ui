import { OppEntity } from "../websocket/lib";
import { OpenPeerPower } from "../types";

export interface ZHAEntityReference extends OppEntity {
  name: string;
}

export interface ZHADevice {
  name: string;
  ieee: string;
  nwk: string;
  lqi: string;
  rssi: string;
  last_seen: string;
  manufacturer: string;
  model: string;
  quirk_applied: boolean;
  quirk_class: string;
  entities: ZHAEntityReference[];
  manufacturer_code: number;
  device_reg_id: string;
  user_given_name?: string;
  power_source?: string;
  area_id?: string;
  device_type: string;
}

export interface Attribute {
  name: string;
  id: number;
}

export interface Cluster {
  name: string;
  id: number;
  endpoint_id: number;
  type: string;
}

export interface Command {
  name: string;
  id: number;
  type: string;
}

export interface ReadAttributeServiceData {
  ieee: string;
  endpoint_id: number;
  cluster_id: number;
  cluster_type: string;
  attribute: number;
  manufacturer?: number;
}

export interface ZHAGroup {
  name: string;
  group_id: number;
  members: ZHADevice[];
}

export const reconfigureNode = (
  opp: OpenPeerPower,
  ieeeAddress: string
): Promise<void> =>
  opp.callWS({
    type: "zha/devices/reconfigure",
    ieee: ieeeAddress,
  });

export const fetchAttributesForCluster = (
  opp: OpenPeerPower,
  ieeeAddress: string,
  endpointId: number,
  clusterId: number,
  clusterType: string
): Promise<Attribute[]> =>
  opp.callWS({
    type: "zha/devices/clusters/attributes",
    ieee: ieeeAddress,
    endpoint_id: endpointId,
    cluster_id: clusterId,
    cluster_type: clusterType,
  });

export const fetchDevices = (opp: OpenPeerPower): Promise<ZHADevice[]> =>
  opp.callWS({
    type: "zha/devices",
  });

export const fetchZHADevice = (
  opp: OpenPeerPower,
  ieeeAddress: string
): Promise<ZHADevice> =>
  opp.callWS({
    type: "zha/device",
    ieee: ieeeAddress,
  });

export const fetchBindableDevices = (
  opp: OpenPeerPower,
  ieeeAddress: string
): Promise<ZHADevice[]> =>
  opp.callWS({
    type: "zha/devices/bindable",
    ieee: ieeeAddress,
  });

export const bindDevices = (
  opp: OpenPeerPower,
  sourceIEEE: string,
  targetIEEE: string
): Promise<void> =>
  opp.callWS({
    type: "zha/devices/bind",
    source_ieee: sourceIEEE,
    target_ieee: targetIEEE,
  });

export const unbindDevices = (
  opp: OpenPeerPower,
  sourceIEEE: string,
  targetIEEE: string
): Promise<void> =>
  opp.callWS({
    type: "zha/devices/unbind",
    source_ieee: sourceIEEE,
    target_ieee: targetIEEE,
  });

export const bindDeviceToGroup = (
  opp: OpenPeerPower,
  deviceIEEE: string,
  groupId: number,
  clusters: Cluster[]
): Promise<void> =>
  opp.callWS({
    type: "zha/groups/bind",
    source_ieee: deviceIEEE,
    group_id: groupId,
    bindings: clusters,
  });

export const unbindDeviceFromGroup = (
  opp: OpenPeerPower,
  deviceIEEE: string,
  groupId: number,
  clusters: Cluster[]
): Promise<void> =>
  opp.callWS({
    type: "zha/groups/unbind",
    source_ieee: deviceIEEE,
    group_id: groupId,
    bindings: clusters,
  });

export const readAttributeValue = (
  opp: OpenPeerPower,
  data: ReadAttributeServiceData
): Promise<string> => {
  return opp.callWS({
    ...data,
    type: "zha/devices/clusters/attributes/value",
  });
};

export const fetchCommandsForCluster = (
  opp: OpenPeerPower,
  ieeeAddress: string,
  endpointId: number,
  clusterId: number,
  clusterType: string
): Promise<Command[]> =>
  opp.callWS({
    type: "zha/devices/clusters/commands",
    ieee: ieeeAddress,
    endpoint_id: endpointId,
    cluster_id: clusterId,
    cluster_type: clusterType,
  });

export const fetchClustersForZhaNode = (
  opp: OpenPeerPower,
  ieeeAddress: string
): Promise<Cluster[]> =>
  opp.callWS({
    type: "zha/devices/clusters",
    ieee: ieeeAddress,
  });

export const fetchGroups = (opp: OpenPeerPower): Promise<ZHAGroup[]> =>
  opp.callWS({
    type: "zha/groups",
  });

export const removeGroups = (
  opp: OpenPeerPower,
  groupIdsToRemove: number[]
): Promise<ZHAGroup[]> =>
  opp.callWS({
    type: "zha/group/remove",
    group_ids: groupIdsToRemove,
  });

export const fetchGroup = (
  opp: OpenPeerPower,
  groupId: number
): Promise<ZHAGroup> =>
  opp.callWS({
    type: "zha/group",
    group_id: groupId,
  });

export const fetchGroupableDevices = (
  opp: OpenPeerPower
): Promise<ZHADevice[]> =>
  opp.callWS({
    type: "zha/devices/groupable",
  });

export const addMembersToGroup = (
  opp: OpenPeerPower,
  groupId: number,
  membersToAdd: string[]
): Promise<ZHAGroup> =>
  opp.callWS({
    type: "zha/group/members/add",
    group_id: groupId,
    members: membersToAdd,
  });

export const removeMembersFromGroup = (
  opp: OpenPeerPower,
  groupId: number,
  membersToRemove: string[]
): Promise<ZHAGroup> =>
  opp.callWS({
    type: "zha/group/members/remove",
    group_id: groupId,
    members: membersToRemove,
  });

export const addGroup = (
  opp: OpenPeerPower,
  groupName: string,
  membersToAdd?: string[]
): Promise<ZHAGroup> =>
  opp.callWS({
    type: "zha/group/add",
    group_name: groupName,
    members: membersToAdd,
  });
