import "../../../src/components/op-iconset-svg";
import iconSetContent from "../../oppio-icons.html";

const documentContainer = document.createElement("template");
documentContainer.setAttribute("style", "display: none;");
documentContainer.innerHTML = iconSetContent;
document.head.appendChild(documentContainer.content);
