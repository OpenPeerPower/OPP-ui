import { LitElement, html, css, property, PropertyValues, customElement } from 'lit-element';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query';
import { installOfflineWatcher } from 'pwa-helpers/network';
import { installRouter } from 'pwa-helpers/router';
import { updateMetadata } from 'pwa-helpers/metadata';
import { OpenPeerPower, OppEntities } from '../types';
import "../components/op-iconset-svg";


// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import { menuIcon } from '../components/my-icons';

import { Appliances } from '../components/appliance-list';

declare global {
  interface Window {
    decodeURIComponent(pathname: string): any;
  }
}

import { invalidAuth } from "../open-peer-power-js-websocket/lib"

@customElement('opp-ui')
export class OPPui extends LitElement {
  @property({type: String}) appTitle = '';
  @property({type: String}) _page = '';
  @property({type: Boolean}) _drawerOpened = false;
  @property({type: Boolean}) _offline = false;
  @property({ type : Object }) opp!: OpenPeerPower;
  @property({type: Array}) private appliances: Appliances = {};
  @property({type: Object}) wsp!: WebSocket | null;

  static get styles() {
    return [
      css`
        :host {
          display: block;

          --app-drawer-width: 256px;

          --app-primary-color: #e91e63;
          --app-secondary-color: #293237;
          --app-dark-text-color: var(--app-secondary-color);
          --app-light-text-color: white;
          --app-section-even-color: #f7f7f7;
          --app-section-odd-color: white;

          --app-header-background-color: white;
          --app-header-text-color: var(--app-dark-text-color);
          --app-header-selected-color: var(--app-primary-color);

          --app-drawer-background-color: var(--app-secondary-color);
          --app-drawer-text-color: var(--app-light-text-color);
          --app-drawer-selected-color: #78909c;
        }

        app-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          text-align: center;
          background-color: var(--app-header-background-color);
          color: var(--app-header-text-color);
          border-bottom: 1px solid #eee;
        }

        .toolbar-top {
          background-color: var(--app-header-background-color);
        }

        [main-title] {
          font-family: 'Pacifico';
          text-transform: lowercase;
          font-size: 30px;
          /* In the narrow layout, the toolbar is offset by the width of the
          drawer button, and the text looks not centered. Add a padding to
          match that button */
          padding-right: 44px;
        }

        .toolbar-list {
          display: none;
        }

        .toolbar-list > a {
          display: inline-block;
          color: var(--app-header-text-color);
          text-decoration: none;
          line-height: 30px;
          padding: 4px 24px;
        }

        .toolbar-list > a[selected] {
          color: var(--app-header-selected-color);
          border-bottom: 4px solid var(--app-header-selected-color);
        }

        .menu-btn {
          background: none;
          border: none;
          fill: var(--app-header-text-color);
          cursor: pointer;
          height: 44px;
          width: 44px;
        }

        .drawer-list {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          padding: 24px;
          background: var(--app-drawer-background-color);
          position: relative;
        }

        .drawer-list > a {
          display: block;
          text-decoration: none;
          color: var(--app-drawer-text-color);
          line-height: 40px;
          padding: 0 24px;
        }

        .drawer-list > a[selected] {
          color: var(--app-drawer-selected-color);
        }

        /* Workaround for IE11 displaying <main> as inline */
        main {
          display: block;
        }

        .main-content {
          padding-top: 64px;
          min-height: 100vh;
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }

        footer {
          padding: 24px;
          background: var(--app-drawer-background-color);
          color: var(--app-drawer-text-color);
          text-align: center;
        }

        /* Wide layout: when the viewport width is bigger than 460px, layout
        changes to a wide layout */
        @media (min-width: 460px) {
          .toolbar-list {
            display: block;
          }

          .menu-btn {
            display: none;
          }

          .main-content {
            padding-top: 107px;
          }

          /* The drawer button isn't shown in the wide layout, so we don't
          need to offset the title */
          [main-title] {
            padding-right: 0px;
          }
        }
      `
    ];
  }

  protected render() {
    // Anything that's related to rendering should be done in here.
    return html`
      <!-- Header -->
      <app-header condenses reveals effects="waterfall">
        <app-toolbar class="toolbar-top">
          <button class="menu-btn" title="Menu" @click="${this._menuButtonClicked}">${menuIcon}</button>
          <div main-title>${this.appTitle}</div>
        </app-toolbar>

        <!-- This gets hidden on a small screen-->
        <nav class="toolbar-list">
          <a ?selected="${this._page === 'view_appliances'}" href="/view_appliances">View Appliances</a>
          <a ?selected="${this._page === 'about'}" href="/about">About</a>
          <a ?selected="${this._page === 'login'}" href="/login">login</a>
        </nav>
      </app-header>
      <script type="module">
        import "./entrypoints/core";
      </script>
      <!-- Drawer content -->
      <app-drawer
          .opened="${this._drawerOpened}"
          @opened-changed="${this._drawerOpenedChanged}">
        <nav class="drawer-list">
          <a ?selected="${this._page === 'view_appliances'}" href="/view_appliances">View Appliances</a>    
          <a ?selected="${this._page === 'about'}" href="/about">About</a>
          <a ?selected="${this._page === 'login'}" href="/login">login</a>       
        </nav>
      </app-drawer>

      <!-- Main content -->
      <main role="main" class="main-content">
        <opp-home-view .appliances="${this.appliances}" .opp="${this.opp}" class="page" ?active="${this._page === 'view_appliances'}"></opp-home-view>
        <about-page class="page" ?active="${this._page === 'about'}"></about-page>
        <opp-login .opp="${this.opp}" .wsp=${this.wsp} class="page" ?active="${this._page === 'login'}"></opp-login>
        <my-view404 class="page" ?active="${this._page === 'view404'}"></my-view404>
      </main>
      <footer>
        <p>Open Peer Power</p>
      </footer>
      <script type="module">
        import "./entrypoints/app";
        window.customPanelJS = "./entrypoints/custom-panel";
      </script>
    `;
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);
  }

  protected firstUpdated() {
    installRouter((location) => this._locationChanged(location));
    installOfflineWatcher((offline) => this._offlineChanged(offline));
    installMediaQueryWatcher(`(min-width: 460px)`,
      () => this._layoutChanged());
      if (invalidAuth) {
        const newLocation = `/login`;
        window.history.pushState({}, '', newLocation);
        this._locationChanged(window.location);
      }
  }

  protected updated(changedProps: PropertyValues) {
    if (changedProps.has('_page')) {
      const pageTitle = this.appTitle + ' - ' + this._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  protected _layoutChanged() {
    // The drawer doesn't make sense in a wide layout, so if it's opened, close it.
    this._updateDrawerState(false);
  }

  protected _offlineChanged(offline: boolean) {
    const previousOffline = this._offline;
    this._offline = offline;

    // Don't show the snackbar on the first load of the page.
    if (previousOffline === undefined) {
      return;
    }
  }

  protected _locationChanged(location: Location) {
    const path = window.decodeURIComponent(location.pathname);
    const page = path === '/' ? 'view_appliances' : path.slice(1);
    this._loadPage(page);
    // Any other info you might want to extract from the path (like page type),
    // you can do here.
    //"""Serve the index view."""
    //opp = request.app['opp']

    //if not opp.components.onboarding.async_is_onboarded():
    //    return web.Response(status=302, headers={
    //       'location': '/onboarding.html'
    //    })

    // Close the drawer - in case the *path* change came from a link in the drawer.
    this._updateDrawerState(false);
  }

  protected _updateDrawerState(opened: boolean) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
    }
  }

  protected _loadPage(page: string) {
    switch(page) {
      case 'view_appliances':
          import('../panels/lovelace/op-panel-lovelace').then(() => {
          //import('../components/opp-home-view').then(() => {
          // Put code in here that you want to run every time when
          // navigating to view1 after view_appliances is loaded.
        });
        break;
      case 'about':
        import('../components/about-page');
        break;
      case 'login':
          import('../components/opp-login');
          break;
      default:
        page = 'view404';
        import('../components/my-view404');
    }

    this._page = page;
  }

  protected _menuButtonClicked() {
    this._updateDrawerState(true);
  }

  protected _drawerOpenedChanged(e: { target: { opened: boolean; }; }) {
    this._updateDrawerState(e.target.opened);
  }
// Tests
  connectedCallback() {
    super.connectedCallback();
  }
  protected _getAllAppliances(): Appliances {
    const APPLIANCE_LIST = [
      {'id': '1', 'name': 'fridge', 'type': 'A',
       'usage': {'value': 10.99},
       'cost': {'currency': 'AUD', 'value': 3}}
      ,
      {'id': '2', 'name': 'dishwasher', 'type': 'B',
       'usage': {'value': 29.99},
       'cost': {'currency': 'AUD', 'value': 4}}
      ,
      {'id': '3', 'name': 'aircon', 'type': 'C',
       'usage': {'value': 30.17},
       'cost': {'currency': 'AUD', 'value': 5}}
      ,
      {'id': '4', 'name': 'Dryer', 'type': 'D',
       'usage': {'value': 12.39},
       'cost': {'currency': 'AUD', 'value': 7}}
    ];
    const appliances = APPLIANCE_LIST.reduce((obj, appliance) => {
      obj[appliance.id] = appliance
      return obj
    }, {} as Appliances);

    return appliances;
  }
  protected _getAllEntities(states): OppEntities {
    const entities = states.reduce((obj, entity) => {
      obj[entity.entity_id] = entity
      return obj
    }, {} as OppEntities);

    return entities;
  }
}