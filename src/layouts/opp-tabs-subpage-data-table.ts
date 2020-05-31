import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  query,
  TemplateResult,
} from "lit-element";
import "../components/data-table/op-data-table";
// tslint:disable-next-line
import {
  OpDataTable,
  DataTableColumnContainer,
  DataTableRowData,
} from "../components/data-table/op-data-table";
import "./opp-tabs-subpage";
import { OpenPeerPower, Route } from "../types";
// tslint:disable-next-line
import { PageNavigation } from "./opp-tabs-subpage";

@customElement("opp-tabs-subpage-data-table")
export class OpTabsSubpageDataTable extends LitElement {
  @property() public opp!: OpenPeerPower;
  @property() public isWide!: boolean;
  @property({ type: Boolean, reflect: true }) public narrow!: boolean;
  /**
   * Object with the columns.
   * @type {Object}
   */
  @property({ type: Object }) public columns: DataTableColumnContainer = {};
  /**
   * Data to show in the table.
   * @type {Array}
   */
  @property({ type: Array }) public data: DataTableRowData[] = [];
  /**
   * Should rows be selectable.
   * @type {Boolean}
   */
  @property({ type: Boolean }) public selectable = false;
  /**
   * Field with a unique id per entry in data.
   * @type {String}
   */
  @property({ type: String }) public id = "id";
  /**
   * String to filter the data in the data table on.
   * @type {String}
   */
  @property({ type: String }) public filter = "";
  /**
   * What path to use when the back button is pressed.
   * @type {String}
   * @attr back-path
   */
  @property({ type: String, attribute: "back-path" }) public backPath?: string;
  /**
   * Function to call when the back button is pressed.
   * @type {() => void}
   */
  @property() public backCallback?: () => void;
  @property() public route!: Route;
  /**
   * Array of tabs to show on the page.
   * @type {Array}
   */
  @property() public tabs!: PageNavigation[];
  @query("op-data-table") private _dataTable!: OpDataTable;

  public clearSelection() {
    this._dataTable.clearSelection();
  }

  protected render(): TemplateResult {
    return html`
      <opp-tabs-subpage
        .opp=${this.opp}
        .narrow=${this.narrow}
        .backPath=${this.backPath}
        .backCallback=${this.backCallback}
        .route=${this.route}
        .tabs=${this.tabs}
      >
        ${this.narrow
          ? html`
              <div slot="header">
                <slot name="header">
                  <div class="search-toolbar">
                    <search-input
                      no-label-float
                      no-underline
                      @value-changed=${this._handleSearchChange}
                    ></search-input>
                  </div>
                </slot>
              </div>
            `
          : ""}
        <op-data-table
          .columns=${this.columns}
          .data=${this.data}
          .filter=${this.filter}
          .selectable=${this.selectable}
          .id=${this.id}
        >
          ${!this.narrow
            ? html`
                <div slot="header">
                  <slot name="header">
                    <slot name="header">
                      <div class="table-header">
                        <search-input
                          no-label-float
                          no-underline
                          @value-changed=${this._handleSearchChange}
                        ></search-input></div></slot
                  ></slot>
                </div>
              `
            : html`
                <div slot="header"></div>
              `}
        </op-data-table>
      </opp-tabs-subpage>
    `;
  }

  private _handleSearchChange(ev: CustomEvent) {
    this.filter = ev.detail.value;
  }

  static get styles(): CSSResult {
    return css`
      op-data-table {
        width: 100%;
        --data-table-border-width: 0;
      }
      :host(:not([narrow])) op-data-table {
        height: calc(100vh - 65px);
        display: block;
      }
      .table-header {
        border-bottom: 1px solid rgba(var(--rgb-primary-text-color), 0.12);
      }
      .search-toolbar {
        margin-left: -24px;
        color: var(--secondary-text-color);
      }
      search-input {
        position: relative;
        top: 2px;
      }
    `;
  }
}
