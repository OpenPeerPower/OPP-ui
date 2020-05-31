import "@polymer/polymer/lib/elements/dom-if";
import "@polymer/polymer/lib/elements/dom-repeat";

import "../components/op-iconset-svg";
import "../resources/op-style";
import "../resources/roboto";

import "../auth/op-authorize";

/* polyfill for paper-dropdown */
setTimeout(
  () =>
    import(
      /* webpackChunkName: "polyfill-web-animations-next" */ "web-animations-js/web-animations-next-lite.min"
    ),
  2000
);
