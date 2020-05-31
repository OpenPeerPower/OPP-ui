import "@polymer/paper-styles/typography";
import "@polymer/polymer/lib/elements/dom-if";
import "@polymer/polymer/lib/elements/dom-repeat";

import "../../src/resources/opp-icons";
import "../../src/resources/op-style";
import "../../src/resources/roboto";
import "../../src/components/op-iconset-svg";

import "./op-demo";
import "./resources/opdemo-icons";

/* polyfill for paper-dropdown */
setTimeout(() => {
  import(
    /* webpackChunkName: "polyfill-web-animations-next" */ "web-animations-js/web-animations-next-lite.min"
  );
}, 1000);
