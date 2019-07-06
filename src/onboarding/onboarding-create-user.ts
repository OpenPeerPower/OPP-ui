import "@polymer/paper-input/paper-input";
import "@material/mwc-button";
import {
  LitElement,
  CSSResult,
  css,
  html,
  PropertyValues,
  property,
  customElement,
  TemplateResult,
} from "lit-element";
import { genClientId } from "../open-peer-power-js-websocket/lib";
import { onboardUserStep } from "../data/onboarding";
import { PolymerChangedEvent } from "../polymer-types";
import { LocalizeFunc } from "../common/translations/localize";
import { fireEvent } from "../common/dom/fire_event";

@customElement("onboarding-create-user")
class OnboardingCreateUser extends LitElement {
  @property() public localize!: LocalizeFunc;

  @property() private _name = "";
  @property() private _username = "";
  @property() private _password = "";
  @property() private _passwordConfirm = "";
  @property() private _loading = false;
  @property() private _errorMsg?: string = undefined;

  protected render(): TemplateResult | void {
    return html`
    <p>
     Take control of your power and keep your privacy.
    </p>

    <p>
      Register your user account.
    </p>

    ${
      this._errorMsg
        ? html`
            <p class="error">
              Fill in all required fields
            </p>
          `
        : ""
    }

    <form>
      <paper-input
        name="name"
        label="Name"
        .value=${this._name}
        @value-changed=${this._handleValueChanged}
        required
        auto-validate
        autocapitalize='on'
        .errorMessage="Required"
        @blur=${this._maybePopulateUsername}
      ></paper-input>

      <paper-input
        name="username"
        label="Username"
        value=${this._username}
        @value-changed=${this._handleValueChanged}
        required
        auto-validate
        autocapitalize='none'
        .errorMessage="Required"
      ></paper-input>

      <paper-input
        name="password"
        label="Password"
        value=${this._password}
        @value-changed=${this._handleValueChanged}
        required
        type='password'
        auto-validate
        .errorMessage="Required"
      ></paper-input>

      <paper-input
        name="passwordConfirm"
        label="Confirm Password"
        value=${this._passwordConfirm}
        @value-changed=${this._handleValueChanged}
        required
        type='password'
        .invalid=${this._password !== "" &&
          this._passwordConfirm !== "" &&
          this._passwordConfirm !== this._password}
        .errorMessage="Passwords don't match"
      ></paper-input>

      <p class="action">
        <mwc-button
          raised
          @click=${this._submitForm}
          .disabled=${this._loading}
        >
          Create Account
        </mwc-button>
      </p>
    </div>
  </form>
`;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    setTimeout(
      () => this.shadowRoot!.querySelector("paper-input")!.focus(),
      100
    );
    this.addEventListener("keypress", (ev) => {
      if (ev.keyCode === 13) {
        this._submitForm(ev);
      }
    });
  }

  private _handleValueChanged(ev: PolymerChangedEvent<string>): void {
    const name = (ev.target as any).name;
    this[`_${name}`] = ev.detail.value;
  }

  private _maybePopulateUsername(): void {
    if (this._username) {
      return;
    }

    const parts = this._name.split(" ");

    if (parts.length) {
      this._username = parts[0].toLowerCase();
    }
  }

  private async _submitForm(ev): Promise<void> {
    debugger;
    ev.preventDefault();
    debugger;
    if (!this._name || !this._username || !this._password) {
      this._errorMsg = "required_fields";
      return;
    }

    if (this._password !== this._passwordConfirm) {
      this._errorMsg = "password_not_match";
      return;
    }

    this._loading = true;
    this._errorMsg = "";

    try {
      const clientId = genClientId();

      const result = await onboardUserStep({
        client_id: clientId,
        name: this._name,
        username: this._username,
        password: this._password,
      });

      fireEvent(this, "onboarding-step", {
        type: "user",
        result,
      });
    } catch (err) {
      // tslint:disable-next-line
      console.error(err);
      this._loading = false;
      this._errorMsg = err.body.message;
    }
  }

  static get styles(): CSSResult {
    return css`
      .error {
        color: red;
      }

      .action {
        margin: 32px 0;
        text-align: center;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "onboarding-create-user": OnboardingCreateUser;
  }
}
