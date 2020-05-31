export interface OppioResponse<T> {
  data: T;
  result: "ok";
}

export const oppioApiResultExtractor = <T>(response: OppioResponse<T>) =>
  response.data;
