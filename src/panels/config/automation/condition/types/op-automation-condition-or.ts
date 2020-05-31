import { OpLogicalCondition } from "./op-automation-condition-logical";
import { customElement } from "lit-element";

@customElement("op-automation-condition-or")
export class OpOrCondition extends OpLogicalCondition {}

declare global {
  interface HTMLElementTagNameMap {
    "op-automation-condition-or": OpOrCondition;
  }
}
