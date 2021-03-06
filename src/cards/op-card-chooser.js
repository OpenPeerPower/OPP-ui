import { PolymerElement } from "@polymer/polymer/polymer-element";

import "./op-camera-card";
import "./op-entities-card";
import "./op-history_graph-card";
import "./op-media_player-card";
import "./op-persistent_notification-card";
import "./op-plant-card";
import "./op-weather-card";

import dynamicContentUpdater from "../common/dom/dynamic_content_updater";

class OpCardChooser extends PolymerElement {
  static get properties() {
    return {
      cardData: {
        type: Object,
        observer: "cardDataChanged",
      },
    };
  }

  _updateCard(newData) {
    dynamicContentUpdater(
      this,
      "OP-" + newData.cardType.toUpperCase() + "-CARD",
      newData
    );
  }

  createObserver() {
    this._updatesAllowed = false;
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.length) return;
      if (entries[0].isIntersecting) {
        this.style.height = "";
        if (this._detachedChild) {
          this.appendChild(this._detachedChild);
          this._detachedChild = null;
        }
        this._updateCard(this.cardData); // Don't use 'newData' as it might have changed.
        this._updatesAllowed = true;
      } else {
        // Set the card to be 48px high. Otherwise if the card is kept as 0px height then all
        // following cards would trigger the observer at once.
        const offsetHeight = this.offsetHeight;
        this.style.height = `${offsetHeight || 48}px`;
        if (this.lastChild) {
          this._detachedChild = this.lastChild;
          this.removeChild(this.lastChild);
        }
        this._updatesAllowed = false;
      }
    });
    this.observer.observe(this);
  }

  cardDataChanged(newData) {
    if (!newData) return;
    // op-entities-card is exempt from observer as it doesn't load heavy resources.
    // and usually doesn't load external resources (except for entity_picture).
    const eligibleToObserver =
      window.IntersectionObserver && newData.cardType !== "entities";
    if (!eligibleToObserver) {
      if (this.observer) {
        this.observer.unobserve(this);
        this.observer = null;
      }
      this.style.height = "";
      this._updateCard(newData);
      return;
    }
    if (!this.observer) {
      this.createObserver();
    }
    if (this._updatesAllowed) {
      this._updateCard(newData);
    }
  }
}
customElements.define("op-card-chooser", OpCardChooser);
