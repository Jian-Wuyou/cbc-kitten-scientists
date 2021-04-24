import { Options } from "../Options";
import { ucfirst } from "../tools/Format";
import { UserScript } from "../UserScript";
import { SettingsSection } from "./SettingsSection";

export class FiltersSettings extends SettingsSection {
  readonly element: JQuery<HTMLElement>;

  private readonly _options: Options["auto"]["filter"];

  private readonly _itemsButton: JQuery<HTMLElement>;

  private readonly _buildingButtons = new Array<JQuery<HTMLElement>>();

  constructor(
    host: UserScript,
    religionOptions: Options["auto"]["filter"] = host.options.auto.filter
  ) {
    super(host);

    this._options = religionOptions;

    const toggleName = "filter";

    const itext = ucfirst(this._host.i18n("ui.filter"));

    // Our main element is a list item.
    const element = $("<li/>", { id: "ks-" + toggleName });

    const label = $("<label/>", {
      for: "toggle-" + toggleName,
      text: itext,
    });

    const input = $("<input/>", {
      id: "toggle-" + toggleName,
      type: "checkbox",
    });

    element.append(input, label);

    // Create build items.
    // We create these in a list that is displayed when the user clicks the "items" button.
    const list = this.getOptionHead(toggleName);

    // Add a border on the element
    element.css("borderBottom", "1px  solid rgba(185, 185, 185, 0.7)");

    this._itemsButton = $("<div/>", {
      id: "toggle-items-" + toggleName,
      text: this._host.i18n("ui.items"),
      css: {
        cursor: "pointer",
        display: "inline-block",
        float: "right",
        paddingRight: "5px",
        textShadow: "3px 3px 4px gray",
      },
    });

    this._itemsButton.on("click", () => {
      list.toggle();
    });

    this._buildingButtons = [
      this.getOption(
        "buildFilter",
        this._options.items.buildFilter,
        this._host.i18n("filter.build")
      ),
      this.getOption(
        "craftFilter",
        this._options.items.craftFilter,
        this._host.i18n("filter.craft")
      ),
      
    ];

    list.append(...this._buildingButtons);

    element.append(this._itemsButton);
    element.append(list);

    this.element = element;
  }

  setState(state: { trigger: number }): void {
    this._triggerButton[0].title = state.trigger;
  }
}
