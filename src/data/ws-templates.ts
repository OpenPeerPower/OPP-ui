import { Connection, UnsubscribeFunc } from "../websocket/lib";

interface RenderTemplateResult {
  result: string;
}

export const subscribeRenderTemplate = (
  conn: Connection,
  onChange: (result: string) => void,
  params: {
    template: string;
    entity_ids?: string | string[];
    variables?: object;
  }
): Promise<UnsubscribeFunc> => {
  return conn.subscribeMessage(
    (msg: RenderTemplateResult) => onChange(msg.result),
    { type: "render_template", ...params }
  );
};
