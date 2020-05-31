import {
  LitElement,
  TemplateResult,
  html,
  CSSResultArray,
  css,
  customElement,
  property,
} from "lit-element";
import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-tabs/paper-tab";
import "@polymer/paper-tabs/paper-tabs";

import "../../src/components/op-menu-button";
import "../../src/resources/op-style";
import "./oppio-tabs-router";

import scrollToTarget from "../../src/common/dom/scroll-to-target";

import { haStyle } from "../../src/resources/styles";
import { OpenPeerPower, Route } from "../../src/types";
import { navigate } from "../../src/common/navigate";
import { OppioHostInfo, OppioOppOSInfo } from "../../src/data/oppio/host";
import {
  OppioSupervisorInfo,
  OppioOpenPeerPowerInfo,
} from "../../src/data/oppio/supervisor";

const HAS_REFRESH_BUTTON = ["store", "snapshots"];

@customElement("oppio-pages-with-tabs")
class OppioPagesWithTabs extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public route!: Route;
  @property() public supervisorInfo!: OppioSupervisorInfo;
  @property() public hostInfo!: OppioHostInfo;
  @property() public oppInfo!: OppioOpenPeerPowerInfo;
  @property() public oppOsInfo!: OppioOppOSInfo;

  protected render(): TemplateResult {
    const page = this._page;
    return html`
      <app-header-layout has-scrolling-region>
        <app-header fixed slot="header">
          <app-toolbar>
            <op-menu-button
              .opp=${this.opp}
              .narrow=${this.narrow}
              oppio
            ></op-menu-button>
            <div main-title>Supervisor</div>
            ${HAS_REFRESH_BUTTON.includes(page)
              ? html`
                  <paper-icon-button
                    icon="oppio:refresh"
                    @click=${this.refreshClicked}
                  ></paper-icon-button>
                `
              : undefined}
          </app-toolbar>
          <paper-tabs
            scrollable
            attr-for-selected="page-name"
            .selected=${page}
            @iron-activate=${this.handlePageSelected}
          >
            <paper-tab page-name="dashboard">Dashboard</paper-tab>
            <paper-tab page-name="snapshots">Snapshots</paper-tab>
            <paper-tab page-name="store">Add-on store</paper-tab>
            <paper-tab page-name="system">System</paper-tab>
          </paper-tabs>
        </app-header>
        <oppio-tabs-router
          .route=${this.route}
          .opp=${this.opp}
          .supervisorInfo=${this.supervisorInfo}
          .hostInfo=${this.hostInfo}
          .oppInfo=${this.oppInfo}
          .oppOsInfo=${this.oppOsInfo}
        ></oppio-tabs-router>
      </app-header-layout>
    `;
  }

  private handlePageSelected(ev) {
    const newPage = ev.detail.item.getAttribute("page-name");
    if (newPage !== this._page) {
      navigate(this, `/oppio/${newPage}`);
    }

    scrollToTarget(
      this,
      // @ts-ignore
      this.shadowRoot!.querySelector("app-header-layout").header.scrollTarget
    );
  }

  private refreshClicked() {
    if (this._page === "snapshots") {
      // @ts-ignore
      this.shadowRoot.querySelector("oppio-snapshots").refreshData();
    } else {
      // @ts-ignore
      this.shadowRoot.querySelector("oppio-addon-store").refreshData();
    }
  }

  private get _page() {
    return this.route.path.substr(1);
  }

  static get styles(): CSSResultArray {
    return [
      haStyle,
      css`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
        }
        paper-tabs {
          margin-left: 12px;
          --paper-tabs-selection-bar-color: var(--text-primary-color, #fff);
          text-transform: uppercase;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "oppio-pages-with-tabs": OppioPagesWithTabs;
  }
}
