import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

class OpServiceDescription extends PolymerElement {
  static get template() {
    return html`
      [[_getDescription(opp, domain, service)]]
    `;
  }

  static get properties() {
    return {
      opp: Object,
      domain: String,
      service: String,
    };
  }

  _getDescription(opp, domain, service) {
    var domainServices = opp.services[domain];
    if (!domainServices) return "";
    var serviceObject = domainServices[service];
    if (!serviceObject) return "";
    return serviceObject.description;
  }
}

customElements.define("op-service-description", OpServiceDescription);
