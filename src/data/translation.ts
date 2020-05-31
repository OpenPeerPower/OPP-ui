import { OpenPeerPower } from "../types";
import { fetchFrontendUserData, saveFrontendUserData } from "./frontend";

export interface FrontendTranslationData {
  language: string;
}

declare global {
  interface FrontendUserData {
    language: FrontendTranslationData;
  }
}

export const fetchTranslationPreferences = (opp: OpenPeerPower) =>
  fetchFrontendUserData(opp.connection, "language");

export const saveTranslationPreferences = (
  opp: OpenPeerPower,
  data: FrontendTranslationData
) => saveFrontendUserData(opp.connection, "language", data);

export const getOppTranslations = async (
  opp: OpenPeerPower,
  language: string
): Promise<{}> => {
  const result = await opp.callWS<{ resources: {} }>({
    type: "frontend/get_translations",
    language,
  });
  return result.resources;
};
