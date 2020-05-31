import { DevconElement, DevconElementConfig } from "../../elements/types";
import { createHuiElement } from "../../create-element/create-hui-element";

export function createStyledHuiElement(
  elementConfig: DevconElementConfig
): DevconElement {
  const element = createHuiElement(elementConfig) as DevconElement;
  // keep conditional card as a transparent container so let its position remain static
  if (element.tagName !== "HUI-CONDITIONAL-ELEMENT") {
    element.classList.add("element");
  }

  if (elementConfig.style) {
    Object.keys(elementConfig.style).forEach((prop) => {
      element.style.setProperty(prop, elementConfig.style[prop]);
    });
  }

  return element;
}
