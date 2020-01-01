import { Constructor } from "lit-element";
import "@polymer/iron-icon/iron-icon";
// Not duplicate, this is for typing.
// tslint:disable-next-line
import { IronIconElement } from "@polymer/iron-icon/iron-icon";

const ironIconClass = customElements.get("iron-icon") as Constructor<
  IronIconElement
>;

let loaded = false;

export class OpIcon extends ironIconClass {
  private _iconsetName?: string;

  public listen(
    node: EventTarget | null,
    eventName: string,
    methodName: string
  ): void {
    super.listen(node, eventName, methodName);
    if (!loaded && this._iconsetName === "mdi") {
      loaded = true;
      import("../resources/mdi-icons");
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-icon": OpIcon;
  }
}

customElements.define("op-icon", OpIcon);
