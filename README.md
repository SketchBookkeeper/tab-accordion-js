# tab-accordion-js
> Easy to use tabs, accordions and tab-accordions

The goal of this package is to help with the creation of tabs, accordions or the all powerful tab-accordion easy without dictating what the markup needs to be. I appreciate ready-made solutions like Foundation, but found that the predefined markup does not fit ever design I encountered.

This package is meant to help quickly link tabs to panels while adding the needed ARIA attributes to the tabs. To maintain flexibility, it does not cover all ARIA attributes, such as adding role `tablist` to the element wrapping the tabs.

## Basic Usage

Example Markup
```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item">
    <button data-tab-panel="tab-1" data-tab-group="group-1" class="nav-link">Tab 1</button>
  </li>

  <li class="nav-item">
    <button data-tab-panel="tab-2" data-tab-group="group-1" class="nav-link">Tab 2</button>
  </li>

  <li class="nav-item">
    <button data-tab-panel="tab-3" data-tab-group="group-1" class="nav-link">Tab 3</button>
  </li>
</ul>

<div>
  <button class="card" data-tab-panel="tab-1" data-tab-group="group-1">Accordion 1</button>

  <div id="tab-1">
    <h2>Panel 1</h2>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
      aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
      occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
  </div>

  <button class="card" data-tab-panel="tab-2" data-tab-group="group-1">Accordion 2</button>

  <div id="tab-2">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </div>

  <button class="card" data-tab-panel="tab-3" data-tab-group="group-1">Accordion 3</button>

  <div id="tab-3">
    <p>
      Panel 3
    </p>
  </div>
</div>
```

Call the `TabAccordions` in your JS.
```JavaScript
new TabAccordions();
```

`TabAccordions` will search the DOM for any elements (preferably `button`s) with `data-tab-group` and group those together as a tab/accordion groups. These element also need the `data-tab-panel` attribute to link that trigger to a panel. This is done through passing the `id` of the panel to `data-tab-panel`.

By default the first elements found with a given `data-tab-panel` will be grouped as tabs and the latter as accordions. This behavior can be overridden by assigning a trigger a type, 'tab' or 'accordion'; with `data-tab-trigger-type`.

## Customizing Tabs

Individual tab groups can be customized by passing options to `data-tab-group-<your-group-name>` or by creating a new instance of `TabAccordion`.

### As a data attribute

Pass the options as JSON to `data-tab-group-<your-group-name>`. It doesn't matter which element you use for this, but using a wrapping element makes the most sense.

Review the example below, notice the use of single quotes.

```html
<ul data-tab-group-my-tabs='{ "breakpoint" : 1040 }'>
  <li>
    <button data-tab-panel="some-panel" data-tab-group="my-tabs">Trigger</button>
  </li>
</ul>
```

### As new instance

```JavaScript
new TabAccordion({
  breakpoint: 1040
})
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| activeTriggerClass | String | "active" | CSS class added to an active trigger element. |
| activeContentClass | String | "active | CSS classed added to the active panel. |
| deepLinking | Boolean | true | Update the url hash to reflect active tab. Visiting page with a panel's `id` in the url will open that tab. |
| hidePanels | Boolean | true | `display:none` will be applied to inactive panels. |
| hideTabs | Boolean | true | Tab triggers will be hidden below breakpoint. |
| hideAccordions | Boolean | true | Accordions trigger will be hidden above breakpoint. |
| breakpoint | Integer | 960 | Point at which to switch from Accordions to Tabs. |
| type | String Boolean | null | A type may be specified if you only need `tab` or `accordion` for the group. This will ignore the breakpoint. |
