import { OpenPeerPower } from "../types";
import { EntityFilter } from "../common/entity/entity_filter";
import { AutomationConfig } from "./automation";
import { PlaceholderContainer } from "../panels/config/automation/thingtalk/dialog-thingtalk";

interface CloudStatusBase {
  logged_in: boolean;
  cloud: "disconnected" | "connecting" | "connected";
}

export interface GoogleEntityConfig {
  should_expose?: boolean;
  override_name?: string;
  aliases?: string[];
  disable_2fa?: boolean;
}

export interface AlexaEntityConfig {
  should_expose?: boolean;
}

export interface CertificateInformation {
  common_name: string;
  expire_date: string;
  fingerprint: string;
}

export interface CloudPreferences {
  google_enabled: boolean;
  alexa_enabled: boolean;
  remote_enabled: boolean;
  google_secure_devices_pin: string | undefined;
  cloudhooks: { [webhookId: string]: CloudWebhook };
  google_entity_configs: {
    [entityId: string]: GoogleEntityConfig;
  };
  alexa_entity_configs: {
    [entityId: string]: AlexaEntityConfig;
  };
  alexa_report_state: boolean;
  google_report_state: boolean;
}

export type CloudStatusLoggedIn = CloudStatusBase & {
  email: string;
  google_entities: EntityFilter;
  google_domains: string[];
  alexa_entities: EntityFilter;
  prefs: CloudPreferences;
  remote_domain: string | undefined;
  remote_connected: boolean;
  remote_certificate: undefined | CertificateInformation;
};

export type CloudStatus = CloudStatusBase | CloudStatusLoggedIn;

export interface SubscriptionInfo {
  human_description: string;
}

export interface CloudWebhook {
  webhook_id: string;
  cloudhook_id: string;
  cloudhook_url: string;
  managed?: boolean;
}

export interface ThingTalkConversion {
  config: Partial<AutomationConfig>;
  placeholders: PlaceholderContainer;
}

export const fetchCloudStatus = (opp: OpenPeerPower) =>
  opp.callWS<CloudStatus>({ type: "cloud/status" });

export const createCloudhook = (opp: OpenPeerPower, webhookId: string) =>
  opp.callWS<CloudWebhook>({
    type: "cloud/cloudhook/create",
    webhook_id: webhookId,
  });

export const deleteCloudhook = (opp: OpenPeerPower, webhookId: string) =>
  opp.callWS({
    type: "cloud/cloudhook/delete",
    webhook_id: webhookId,
  });

export const connectCloudRemote = (opp: OpenPeerPower) =>
  opp.callWS({
    type: "cloud/remote/connect",
  });

export const disconnectCloudRemote = (opp: OpenPeerPower) =>
  opp.callWS({
    type: "cloud/remote/disconnect",
  });

export const fetchCloudSubscriptionInfo = (opp: OpenPeerPower) =>
  opp.callWS<SubscriptionInfo>({ type: "cloud/subscription" });

export const convertThingTalk = (opp: OpenPeerPower, query: string) =>
  opp.callWS<ThingTalkConversion>({ type: "cloud/thingtalk/convert", query });

export const updateCloudPref = (
  opp: OpenPeerPower,
  prefs: {
    google_enabled?: CloudPreferences["google_enabled"];
    alexa_enabled?: CloudPreferences["alexa_enabled"];
    alexa_report_state?: CloudPreferences["alexa_report_state"];
    google_report_state?: CloudPreferences["google_report_state"];
    google_secure_devices_pin?: CloudPreferences["google_secure_devices_pin"];
  }
) =>
  opp.callWS({
    type: "cloud/update_prefs",
    ...prefs,
  });

export const updateCloudGoogleEntityConfig = (
  opp: OpenPeerPower,
  entityId: string,
  values: GoogleEntityConfig
) =>
  opp.callWS<GoogleEntityConfig>({
    type: "cloud/google_assistant/entities/update",
    entity_id: entityId,
    ...values,
  });

export const cloudSyncGoogleAssistant = (opp: OpenPeerPower) =>
  opp.callApi("POST", "cloud/google_actions/sync");

export const updateCloudAlexaEntityConfig = (
  opp: OpenPeerPower,
  entityId: string,
  values: AlexaEntityConfig
) =>
  opp.callWS<AlexaEntityConfig>({
    type: "cloud/alexa/entities/update",
    entity_id: entityId,
    ...values,
  });
