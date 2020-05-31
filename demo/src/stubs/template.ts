import { MockOpenPeerPower } from "../../../src/fake_data/provide_opp";

export const mockTemplate = (opp: MockOpenPeerPower) => {
  opp.mockAPI("template", () =>
    Promise.reject({
      body: { message: "Template dev tool does not work in the demo." },
    })
  );
};
