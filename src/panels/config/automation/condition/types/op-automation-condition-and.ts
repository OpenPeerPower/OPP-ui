import { OpLogicalCondition } from "./op-automation-condition-logical";
import { customElement } from "lit-element";

@customElement("op-automation-condition-and")
export class OpAndCondition extends OpLogicalCondition {}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-condition-and": OpAndCondition;
  }
}
