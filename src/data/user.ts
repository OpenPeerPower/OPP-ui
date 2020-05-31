import { OpenPeerPower } from "../types";
import { Credential } from "./auth";

export const SYSTEM_GROUP_ID_ADMIN = "system-admin";
export const SYSTEM_GROUP_ID_USER = "system-users";
export const SYSTEM_GROUP_ID_READ_ONLY = "system-read-only";

export interface User {
  id: string;
  name: string;
  is_owner: boolean;
  is_active: boolean;
  system_generated: boolean;
  group_ids: string[];
  credentials: Credential[];
}

interface UpdateUserParams {
  name?: User["name"];
  group_ids?: User["group_ids"];
}

export const fetchUsers = async (opp: OpenPeerPower) =>
  opp.callWS<User[]>({
    type: "config/auth/list",
  });

export const createUser = async (opp: OpenPeerPower, name: string) =>
  opp.callWS<{ user: User }>({
    type: "config/auth/create",
    name,
  });

export const updateUser = async (
  opp: OpenPeerPower,
  userId: string,
  params: UpdateUserParams
) =>
  opp.callWS<{ user: User }>({
    ...params,
    type: "config/auth/update",
    user_id: userId,
  });

export const deleteUser = async (opp: OpenPeerPower, userId: string) =>
  opp.callWS<void>({
    type: "config/auth/delete",
    user_id: userId,
  });
