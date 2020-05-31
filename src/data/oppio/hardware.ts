import { OpenPeerPower } from "../../types";
import { OppioResponse, oppioApiResultExtractor } from "./common";

export interface OppioHardwareAudioDevice {
  device?: string | null;
  name: string;
}

interface OppioHardwareAudioList {
  audio: {
    input: { [key: string]: string };
    output: { [key: string]: string };
  };
}

export interface OppioHardwareInfo {
  serial: string[];
  input: string[];
  disk: string[];
  gpio: string[];
  audio: object;
}

export const fetchOppioHardwareAudio = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioHardwareAudioList>>(
      "GET",
      "oppio/hardware/audio"
    )
  );
};

export const fetchOppioHardwareInfo = async (opp: OpenPeerPower) => {
  return oppioApiResultExtractor(
    await opp.callApi<OppioResponse<OppioHardwareInfo>>(
      "GET",
      "oppio/hardware/info"
    )
  );
};
