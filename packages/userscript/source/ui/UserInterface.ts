import { Options } from "../options/Options";
import { UserScript } from "../UserScript";
import { BonfireSettingsUi } from "./BonfireSettingsUi";
import { CraftSettingsUi } from "./CraftSettingsUi";
import { EngineSettingsUi } from "./EngineSettingsUi";
import { FiltersSettingsUi } from "./FilterSettingsUi";
import { OptionsSettingsUi } from "./OptionsSettingsUi";
import { ReligionSettingsUi } from "./ReligionSettingsUi";
import { ScienceSettingsUi } from "./ScienceSettingsUi";
import { SpaceSettingsUi } from "./SpaceSettingsUi";
import { TimeControlSettingsUi } from "./TimeControlSettingsUi";
import { TimeSettingsUi } from "./TimeSettingsUi";
import { TradingSettingsUi } from "./TradingSettingsUi";
import { VillageSettingsUi } from "./VillageSettingsUi";

export class UserInterface {
  private readonly _host: UserScript;

  private _engineUi: EngineSettingsUi;
  private _bonfireUi: BonfireSettingsUi;
  private _spaceUi: SpaceSettingsUi;
  private _craftUi: CraftSettingsUi;
  private _unlockUi: ScienceSettingsUi;
  private _tradingUi: TradingSettingsUi;
  private _religionUi: ReligionSettingsUi;
  private _timeUi: TimeSettingsUi;
  private _timeCtrlUi: TimeControlSettingsUi;
  private _distributeUi: VillageSettingsUi;
  private _optionsUi: OptionsSettingsUi;
  private _filterUi: FiltersSettingsUi;

  constructor(host: UserScript) {
    this._host = host;

    this._engineUi = new EngineSettingsUi(this._host);
    this._bonfireUi = new BonfireSettingsUi(this._host);
    this._spaceUi = new SpaceSettingsUi(this._host);
    this._craftUi = new CraftSettingsUi(this._host);
    this._unlockUi = new ScienceSettingsUi(this._host);
    this._tradingUi = new TradingSettingsUi(this._host);
    this._religionUi = new ReligionSettingsUi(this._host);
    this._timeUi = new TimeSettingsUi(this._host);
    this._timeCtrlUi = new TimeControlSettingsUi(this._host);
    this._distributeUi = new VillageSettingsUi(this._host);
    this._optionsUi = new OptionsSettingsUi(this._host);
    this._filterUi = new FiltersSettingsUi(this._host);
  }

  construct(): void {
    this._installCss();

    const kg_version = "Kitten Scientists v2.0.0-alpha.3";
    const optionsElement = $("<div/>", { id: "ks-options", css: { marginBottom: "10px" } });
    const optionsListElement = $("<ul/>");
    const optionsTitleElement = $("<div/>", {
      css: { bottomBorder: "1px solid gray", marginBottom: "5px" },
      text: kg_version,
    });

    optionsElement.append(optionsTitleElement);

    const engineListElement = this._engineUi.element.children("#items-list-engine");

    engineListElement.append(this._bonfireUi.element);
    engineListElement.append(this._distributeUi.element);
    engineListElement.append(this._unlockUi.element);
    engineListElement.append(this._craftUi.element);
    engineListElement.append(this._tradingUi.element);
    engineListElement.append(this._religionUi.element);
    engineListElement.append(this._spaceUi.element);
    engineListElement.append(this._timeUi.element);
    engineListElement.append(this._timeCtrlUi.element);
    engineListElement.append(this._optionsUi.element);
    engineListElement.append(this._filterUi.element);

    optionsListElement.append(this._engineUi.element);

    // Set up the "show activity summary" area.
    const activityBox = $("<div/>", {
      id: "activity-box",
      css: {
        display: "inline-block",
        verticalAlign: "bottom",
      },
    });

    const showActivity = $("<a/>", {
      id: "showActivityHref",
      text: "📝",
      title: this._host.i18n("summary.show"),
      href: "#",
    });

    showActivity.on("click", () => this._host.displayActivitySummary());

    activityBox.append(showActivity);

    $("#clearLog").prepend(activityBox);

    // add the options above the game log
    const right = $("#rightColumn");
    right.prepend(optionsElement.append(optionsListElement));
  }

  getState(): Options {
    const result = new Options();
    result.auto.engine = this._engineUi.getState();
    result.auto.bonfire = this._bonfireUi.getState();
    result.auto.space = this._spaceUi.getState();
    result.auto.craft = this._craftUi.getState();
    result.auto.unlock = this._unlockUi.getState();
    result.auto.trade = this._tradingUi.getState();
    result.auto.religion = this._religionUi.getState();
    result.auto.time = this._timeUi.getState();
    result.auto.timeCtrl = this._timeCtrlUi.getState();
    result.auto.village = this._distributeUi.getState();
    result.auto.options = this._optionsUi.getState();
    result.auto.filters = this._filterUi.getState();
    return result;
  }

  setState(state: Options): void {
    this._engineUi.setState(state.auto.engine);
    this._bonfireUi.setState(state.auto.bonfire);
    this._spaceUi.setState(state.auto.space);
    this._craftUi.setState(state.auto.craft);
    this._unlockUi.setState(state.auto.unlock);
    this._tradingUi.setState(state.auto.trade);
    this._religionUi.setState(state.auto.religion);
    this._timeUi.setState(state.auto.time);
    this._timeCtrlUi.setState(state.auto.timeCtrl);
    this._distributeUi.setState(state.auto.village);
    this._optionsUi.setState(state.auto.options);
    this._filterUi.setState(state.auto.filters);
  }

  refreshUi(): void {
    this._engineUi.refreshUi();
    this._bonfireUi.refreshUi();
    this._spaceUi.refreshUi();
    this._craftUi.refreshUi();
    this._unlockUi.refreshUi();
    this._tradingUi.refreshUi();
    this._religionUi.refreshUi();
    this._timeUi.refreshUi();
    this._timeCtrlUi.refreshUi();
    this._distributeUi.refreshUi();
    this._optionsUi.refreshUi();
    this._filterUi.refreshUi();
  }

  private _installCss(): void {
    // This development panel overlays the UI in the Sleek theme.
    this._addRule("#devPanel { display: none !important; }");

    // Basic layout for our own list-based options menus.
    this._addRule("#ks-options ul { list-style: none; margin: 0 0 5px; padding: 0; }");
    this._addRule('#ks-options ul:after { clear: both; content: " "; display: block; height: 0; }');
    this._addRule("#ks-options ul li { display: block; float: left; width: 100%; }");

    // Rules needed to enable stock warning.
    this._addRule(`
      #ks-options #toggle-list-resources .stockWarn *,
      #ks-options #toggle-reset-list-resources .stockWarn * {
        color: #DD1E00;
      }`);

    // Ensure the right column gets a scrollbar, when our content extends it too far down.
    this._addRule("body #gamePageContainer #game #rightColumn { overflow-y: auto }");
  }

  private _addRule(rule: string) {
    const sheets = document.styleSheets;
    sheets[0].insertRule(rule, 0);
  }
}
