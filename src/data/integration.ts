import { LocalizeFunc } from "../common/translations/localize";

export const integrationDocsUrl = (domain: string) =>
  `https://www.open-peer-power.io/integrations/${domain}`;

export const integrationIssuesUrl = (domain: string) =>
  `https://github.com/open-peer-power/open-peer-power/issues?q=is%3Aissue+is%3Aopen+label%3A%22integration%3A+${domain}%22`;

export const domainToName = (localize: LocalizeFunc, domain: string) =>
  localize(`domain.${domain}`) || domain;
