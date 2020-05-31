import "../components/op-iconset-svg";
import "../resources/op-style";
import "../resources/roboto";
import "../onboarding/op-onboarding";

declare global {
  interface Window {
    stepsPromise: Promise<Response>;
  }
}
