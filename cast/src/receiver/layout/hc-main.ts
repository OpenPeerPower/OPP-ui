import {
  getAuth,
  createConnection,
  UnsubscribeFunc,
} from "open-peer-power-js-websocket";
import { customElement, TemplateResult, html, property } from "lit-element";
import { OppElement } from "../../../../src/state/opp-element";
import {
  OppMessage,
  ConnectMessage,
  ShowDevconViewMessage,
  GetStatusMessage,
  ShowDemoMessage,
} from "../../../../src/cast/receiver_messages";
import { DevconConfig, getDevconCollection } from "../../../../src/data/devcon";
import "./hc-launch-screen";
import { castContext } from "../cast_context";
import { CAST_NS } from "../../../../src/cast/const";
import { ReceiverStatusMessage } from "../../../../src/cast/sender_messages";
import { loadDevconResources } from "../../../../src/panels/devcon/common/load-resources";
import { isNavigationClick } from "../../../../src/common/dom/is-navigation-click";

@customElement("hc-main")
export class HcMain extends OppElement {
  @property() private _showDemo = false;

  @property() private _devconConfig?: DevconConfig;

  @property() private _devconPath: string | number | null = null;

  @property() private _error?: string;

  private _unsubDevcon?: UnsubscribeFunc;

  public processIncomingMessage(msg: OppMessage) {
    if (msg.type === "connect") {
      this._handleConnectMessage(msg);
    } else if (msg.type === "show_devcon_view") {
      this._handleShowDevconMessage(msg);
    } else if (msg.type === "get_status") {
      this._handleGetStatusMessage(msg);
    } else if (msg.type === "show_demo") {
      this._handleShowDemo(msg);
    } else {
      // tslint:disable-next-line: no-console
      console.warn("unknown msg type", msg);
    }
  }

  protected render(): TemplateResult {
    if (this._showDemo) {
      return html`
        <hc-demo .devconPath=${this._devconPath}></hc-demo>
      `;
    }

    if (
      !this._devconConfig ||
      this._devconPath === null ||
      // Guard against part of HA not being loaded yet.
      (this.opp && (!this.opp.states || !this.opp.config || !this.opp.services))
    ) {
      return html`
        <hc-launch-screen
          .opp=${this.opp}
          .error=${this._error}
        ></hc-launch-screen>
      `;
    }
    return html`
      <hc-devcon
        .opp=${this.opp}
        .devconConfig=${this._devconConfig}
        .viewPath=${this._devconPath}
      ></hc-devcon>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    import("../second-load");
    window.addEventListener("location-changed", () => {
      if (location.pathname.startsWith("/devcon/")) {
        this._devconPath = location.pathname.substr(10);
        this._sendStatus();
      }
    });
    document.body.addEventListener("click", (ev) => {
      const href = isNavigationClick(ev);
      if (href && href.startsWith("/devcon/")) {
        this._devconPath = href.substr(10);
        this._sendStatus();
      }
    });
  }

  private _sendStatus(senderId?: string) {
    const status: ReceiverStatusMessage = {
      type: "receiver_status",
      connected: !!this.opp,
      showDemo: this._showDemo,
    };

    if (this.opp) {
      status.oppUrl = this.opp.auth.data.oppUrl;
      status.devconPath = this._devconPath!;
    }

    if (senderId) {
      this.sendMessage(senderId, status);
    } else {
      for (const sender of castContext.getSenders()) {
        this.sendMessage(sender.id, status);
      }
    }
  }

  private async _handleGetStatusMessage(msg: GetStatusMessage) {
    this._sendStatus(msg.senderId!);
  }

  private async _handleConnectMessage(msg: ConnectMessage) {
    let auth;
    try {
      auth = await getAuth({
        loadTokens: async () => ({
          oppUrl: msg.oppUrl,
          clientId: msg.clientId,
          refresh_token: msg.refreshToken,
          access_token: "",
          expires: 0,
          expires_in: 0,
        }),
      });
    } catch (err) {
      this._error = this._getErrorMessage(err);
      return;
    }
    let connection;
    try {
      connection = await createConnection({ auth });
    } catch (err) {
      this._error = this._getErrorMessage(err);
      return;
    }
    if (this.opp) {
      this.opp.connection.close();
    }
    this.initializeOpp(auth, connection);
    this._error = undefined;
    this._sendStatus();
  }

  private async _handleShowDevconMessage(msg: ShowDevconViewMessage) {
    // We should not get this command before we are connected.
    // Means a client got out of sync. Let's send status to them.
    if (!this.opp) {
      this._sendStatus(msg.senderId!);
      this._error = "Cannot show Devcon because we're not connected.";
      return;
    }
    if (!this._unsubDevcon) {
      const llColl = getDevconCollection(this.opp!.connection);
      // We first do a single refresh because we need to check if there is LL
      // configuration.
      try {
        await llColl.refresh();
        this._unsubDevcon = llColl.subscribe((devconConfig) =>
          this._handleNewDevconConfig(devconConfig)
        );
      } catch (err) {
        // Generate a Devcon config.
        this._unsubDevcon = () => undefined;
        const { generateDevconConfigFromOpp } = await import(
          "../../../../src/panels/devcon/common/generate-devcon-config"
        );
        this._handleNewDevconConfig(
          await generateDevconConfigFromOpp(this.opp!)
        );
      }
    }
    this._showDemo = false;
    this._devconPath = msg.viewPath;
    if (castContext.getDeviceCapabilities().touch_input_supported) {
      this._breakFree();
    }
    this._sendStatus();
  }

  private _handleNewDevconConfig(devconConfig: DevconConfig) {
    castContext.setApplicationState(devconConfig.title!);
    this._devconConfig = devconConfig;
    if (devconConfig.resources) {
      loadDevconResources(devconConfig.resources, this.opp!.auth.data.oppUrl);
    }
  }

  private _handleShowDemo(_msg: ShowDemoMessage) {
    import("./hc-demo").then(() => {
      this._showDemo = true;
      this._devconPath = "overview";
      this._sendStatus();
      if (castContext.getDeviceCapabilities().touch_input_supported) {
        this._breakFree();
      }
    });
  }

  private _getErrorMessage(error: number): string {
    switch (error) {
      case 1:
        return "Unable to connect to the Open Peer Power websocket API.";
      case 2:
        return "The supplied authentication is invalid.";
      case 3:
        return "The connection to Open Peer Power was lost.";
      case 4:
        return "Missing oppUrl. This is required.";
      case 5:
        return "Open Peer Power needs to be served over https:// to use with Open Peer Power Cast.";
      default:
        return "Unknown Error";
    }
  }

  private _breakFree() {
    const controls = document.body.querySelector("touch-controls");
    if (controls) {
      controls.remove();
    }
    document.body.setAttribute("style", "overflow-y: auto !important");
  }

  private sendMessage(senderId: string, response: any) {
    castContext.sendCustomMessage(CAST_NS, senderId, response);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-main": HcMain;
  }
}
