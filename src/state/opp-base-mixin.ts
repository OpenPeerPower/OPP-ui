import { LitElement, property } from "lit-element";
import { OpenPeerPower } from "../types";
import { Auth, Connection } from "../websocket/lib";

export class OppBaseEl extends LitElement {
  @property() public opp?: OpenPeerPower;
  protected _pendingOpp: Partial<OpenPeerPower> = {};
  // tslint:disable-next-line: variable-name
  private __provideOpp: HTMLElement[] = [];

  public provideOpp(el) {
    this.__provideOpp.push(el);
    el.opp = this.opp;
  }

  protected initializeOpp(_auth: Auth, _conn: Connection) {
    // implemented in connection-mixin
    // tslint:disable-next-line
  }

  // Exists so all methods can safely call super method
  protected oppConnected() {
    // tslint:disable-next-line
  }

  protected oppReconnected() {
    // tslint:disable-next-line
  }

  protected oppDisconnected() {
    // tslint:disable-next-line
  }

  protected panelUrlChanged(_newPanelUrl) {
    // tslint:disable-next-line
  }

  protected oppChanged(opp, _oldOpp) {
    this.__provideOpp.forEach((el) => {
      (el as any).opp = opp;
    });
  }

  protected _updateOpp(obj: Partial<OpenPeerPower>) {
    if (!this.opp) {
      this._pendingOpp = { ...this._pendingOpp, ...obj };
      return;
    }
    this.opp = { ...this.opp, ...obj };
  }
}
