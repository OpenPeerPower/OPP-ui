import {
  LitElement,
  customElement,
  property,
  TemplateResult,
  html,
  PropertyValues,
  CSSResult,
  css,
} from "lit-element";
import { OpenPeerPower, Route } from "../../../src/types";
import { createOppioSession } from "../../../src/data/oppio/supervisor";
import {
  OppioAddonDetails,
  fetchOppioAddonInfo,
} from "../../../src/data/oppio/addon";
import "../../../src/layouts/opp-loading-screen";
import "../../../src/layouts/opp-subpage";

@customElement("oppio-ingress-view")
class OppioIngressView extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public route!: Route;
  @property() private _addon?: OppioAddonDetails;

  protected render(): TemplateResult {
    if (!this._addon) {
      return html`
        <opp-loading-screen></opp-loading-screen>
      `;
    }

    return html`
      <opp-subpage .header=${this._addon.name} oppio>
        <iframe src=${this._addon.ingress_url}></iframe>
      </opp-subpage>
    `;
  }

  protected updated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    if (!changedProps.has("route")) {
      return;
    }

    const addon = this.route.path.substr(1);

    const oldRoute = changedProps.get("route") as this["route"] | undefined;
    const oldAddon = oldRoute ? oldRoute.path.substr(1) : undefined;

    if (addon && addon !== oldAddon) {
      this._fetchData(addon);
    }
  }

  private async _fetchData(addonSlug: string) {
    try {
      const [addon] = await Promise.all([
        fetchOppioAddonInfo(this.opp, addonSlug).catch(() => {
          throw new Error("Failed to fetch add-on info");
        }),
        createOppioSession(this.opp).catch(() => {
          throw new Error("Failed to create an ingress session");
        }),
      ]);

      if (!addon.ingress) {
        throw new Error("This add-on does not support ingress");
      }

      this._addon = addon;
    } catch (err) {
      // tslint:disable-next-line
      console.error(err);
      alert(err.message || "Unknown error starting ingress.");
      history.back();
    }
  }

  static get styles(): CSSResult {
    return css`
      iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
      }
      paper-icon-button {
        color: var(--text-primary-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-ingress-view": OppioIngressView;
  }
}
