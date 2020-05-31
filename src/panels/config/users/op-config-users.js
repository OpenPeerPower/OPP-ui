import "@polymer/app-route/app-route";
import { timeOut } from "@polymer/polymer/lib/utils/async";
import { Debouncer } from "@polymer/polymer/lib/utils/debounce";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import NavigateMixin from "../../../mixins/navigate-mixin";

import "./op-config-user-picker";
import "./op-user-editor";
import { fireEvent } from "../../../common/dom/fire_event";
import { fetchUsers } from "../../../data/user";

/*
 * @appliesMixin NavigateMixin
 */
class OpConfigUsers extends NavigateMixin(PolymerElement) {
  static get template() {
    return html`
      <app-route
        route="[[route]]"
        pattern="/:user"
        data="{{_routeData}}"
      ></app-route>

      <template is="dom-if" if='[[_equals(_routeData.user, "picker")]]'>
        <op-config-user-picker
          opp="[[opp]]"
          users="[[_users]]"
          is-wide="[[isWide]]"
          narrow="[[narrow]]"
          route="[[route]]"
        ></op-config-user-picker>
      </template>
      <template
        is="dom-if"
        if='[[!_equals(_routeData.user, "picker")]]'
        restamp
      >
        <op-user-editor
          opp="[[opp]]"
          user="[[_computeUser(_users, _routeData.user)]]"
          narrow="[[narrow]]"
          route="[[route]]"
        ></op-user-editor>
      </template>
    `;
  }

  static get properties() {
    return {
      opp: Object,
      isWide: Boolean,
      narrow: Boolean,
      route: {
        type: Object,
        observer: "_checkRoute",
      },
      _routeData: Object,
      _user: {
        type: Object,
        value: null,
      },
      _users: {
        type: Array,
        value: null,
      },
    };
  }

  ready() {
    super.ready();
    this._loadData();
    this.addEventListener("reload-users", () => this._loadData());
  }

  _handlePickUser(ev) {
    this._user = ev.detail.user;
  }

  _checkRoute(route) {
    // prevent list getting under toolbar
    fireEvent(this, "iron-resize");

    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(0),
      () => {
        if (route.path === "") {
          this.navigate(`${route.prefix}/picker`, true);
        }
      }
    );
  }

  _computeUser(users, userId) {
    return users && users.filter((u) => u.id === userId)[0];
  }

  _equals(a, b) {
    return a === b;
  }

  async _loadData() {
    this._users = await fetchUsers(this.opp);
  }
}

customElements.define("op-config-users", OpConfigUsers);
