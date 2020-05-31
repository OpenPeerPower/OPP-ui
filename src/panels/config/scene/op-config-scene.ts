import "@polymer/app-route/app-route";

import "./op-scene-editor";
import "./op-scene-dashboard";

import { OppRouterPage, RouterOptions } from "../../../layouts/opp-router-page";
import { property, customElement, PropertyValues } from "lit-element";
import { OpenPeerPower } from "../../../types";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { computeStateName } from "../../../common/entity/compute_state_name";
import { compare } from "../../../common/string/compare";
import { SceneEntity } from "../../../data/scene";
import memoizeOne from "memoize-one";
import { OppEntities } from "../../../websocket/lib";

@customElement("op-config-scene")
class OpConfigScene extends OppRouterPage {
  @property() public opp!: OpenPeerPower;
  @property() public narrow!: boolean;
  @property() public isWide!: boolean;
  @property() public showAdvanced!: boolean;
  @property() public scenes: SceneEntity[] = [];

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    routes: {
      dashboard: {
        tag: "op-scene-dashboard",
        cache: true,
      },
      edit: {
        tag: "op-scene-editor",
      },
    },
  };

  private _computeScenes = memoizeOne((states: OppEntities) => {
    const scenes: SceneEntity[] = [];
    Object.values(states).forEach((state) => {
      if (computeStateDomain(state) === "scene" && !state.attributes.hidden) {
        scenes.push(state as SceneEntity);
      }
    });

    return scenes.sort((a, b) => {
      return compare(computeStateName(a), computeStateName(b));
    });
  });

  public disconnectedCallback() {
    super.disconnectedCallback();
  }

  protected updatePageEl(pageEl, changedProps: PropertyValues) {
    pageEl.opp = this.opp;
    pageEl.narrow = this.narrow;
    pageEl.isWide = this.isWide;
    pageEl.route = this.routeTail;
    pageEl.showAdvanced = this.showAdvanced;

    if (this.opp) {
      pageEl.scenes = this._computeScenes(this.opp.states);
    }

    if (
      (!changedProps || changedProps.has("route")) &&
      this._currentPage === "edit"
    ) {
      pageEl.creatingNew = undefined;
      const sceneId = this.routeTail.path.substr(1);
      pageEl.creatingNew = sceneId === "new" ? true : false;
      pageEl.scene =
        sceneId === "new"
          ? undefined
          : pageEl.scenes.find(
              (entity: SceneEntity) => entity.attributes.id === sceneId
            );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "op-config-scene": OpConfigScene;
  }
}
