import merge from 'lodash/merge'
import debounce from 'lodash/debounce'
import forOwn from 'lodash/forOwn'
import upperFirst from 'lodash/upperFirst'

/**
 * Tabby
 */
const Tabby = (function () {
  let defaults = {
    activeTriggerClass: 'active',
    activeContentClass: 'active',
    deepLinking: true,
    hidePanels: true,
    breakpoint: 960,
    type: false
  }

  const BuildTabby = function (groupName, options) {
    const views = ['tab', 'accordion']
    let publicAPIs = {}
    let settings

    // Check if user defined a type 'accordion' or 'type'
    // Otherwise set the value.
    let currentView = options.type || 'accordion'

    // Private Methods
    function runTabby (groupName, options) {
      publicAPIs.items = sortItems(collectitems(groupName))
      bindClickEvents(groupName)

      // if user defines a type don't check sizes
      if (!options.type) {
        checkView()

        bindResizeEvents()
      }

      // Hide panels for the user
      if (options.hidePanels) {
        publicAPIs.closeAll()
      }
    }

    // TODO Make setup aria function

    // Handle clicks
    function bindClickEvents (groupName) {
      window.addEventListener('click', e => {
        const el = e.target.closest(`[data-tabby-group="${groupName}"]`)
        if (!el) return

        publicAPIs.open(el.dataset.tabbyPanel)
      })
    }

    // Add resize event handing
    function bindResizeEvents () {
      window.addEventListener('resize', debounce(() => {
        const previousView = currentView
        checkView()

        if (previousView !== currentView) {
          setView()
        }
      }, 300))
    }

    // Check the viewport and determine if current view should be tabs or accordions
    function checkView () {
      if (window.innerWidth < settings.breakpoint) {
        currentView = 'accordion'
      } else {
        currentView = 'tab'
      }
    }

    function setView () {
      if (currentView === 'accordion') {
        setUpAccordionView()
      } else {
        setUpTabs()
      }
    }

    // Prepare the accordion view.
    function setUpAccordionView () {
      publicAPIs.closeAll()
    }

    // Prepare the tab view
    // Get the first tab and open it.
    function setUpTabs () {
      publicAPIs.closeAll()

      const firstTab = Object.keys(publicAPIs.items['tab'])[0]

      open(firstTab, 'tab')
    }

    function collectitems (groupName) {
      return [...document.querySelectorAll(`[data-tabby-group="${groupName}"]`)]
    }

    // Sort and cache the items into types, tab or accordion.
    // Function will assume the elements found in the DOM first are tabs,
    // followed by accordion items.
    // This behavior can be changed by providing a type on the trigger element
    // i.e. data-tabby-trigger-type="accordion"
    function sortItems (items) {
      const sorteditems = {
        tab: {},
        accordion: {}
      }

      items.forEach(trigger => {
        let group = 'tab' // Group name
        const panelName = trigger.dataset.tabbyPanel

        // Sort to accordion if tab for panel is already present
        if (sorteditems.tab.hasOwnProperty(panelName)) group = 'accordion'

        // Allow Developer to override for unique layouts
        if (trigger.dataset.tabbyTriggerType) {
          group = trigger.dataset.tabbyTriggerType
        }

        sorteditems[group][panelName] = {
          el: trigger,
          panel: document.getElementById(panelName)
        }
      })

      return sorteditems
    }

    // Open the panel and give the trigger the needed attributes
    function open (panelName, type) {
      if (!panelName) return

      // Check if we have valid parameters
      if (
        !publicAPIs.items[type].hasOwnProperty(panelName) ||
        !publicAPIs.items[type][panelName].hasOwnProperty('el') ||
        !publicAPIs.items[type][panelName].hasOwnProperty('panel')
      ) {
        return
      }

      const panelObject = publicAPIs.items[type][panelName]
      const triggerElement = panelObject.el
      const panelElement = panelObject.panel

      // The aria attribute that identifies an open panel is based on type
      // tabs are expecting 'aria-selected' while accordion needs 'aria-expanded'
      const ariaSelected = type === 'tab' ? 'aria-selected' : 'aria-expanded'

      // Select the Trigger
      triggerElement.classList.add(settings.activeTriggerClass)
      triggerElement.setAttribute(ariaSelected, true)

      // Open the Panel
      panelElement.classList.add(settings.activeContentClass)
      // Developer may choose to use active class to display panel,
      // rather than let the plugin set the display.
      if (settings.hidePanels) {
        panelElement.style.display = 'block'
      }

      // Update the API
      publicAPIs.active = panelName
    }

    // Close the panel and unset the trigger
    function close (panelName, type) {
      const panelObject = publicAPIs.items[type][panelName]
      const triggerElement = panelObject.el
      const panelElement = panelObject.panel

      const ariaSelected = type === 'tab' ? 'aria-selected' : 'aria-expanded'

      triggerElement.classList.remove(settings.activeTriggerClass)
      triggerElement.setAttribute(ariaSelected, false)

      if (settings.hidePanels) {
        panelElement.style.display = 'none'
      }

      publicAPIs.active = null
    }

    // PublicAPIs

    // Set defaults
    publicAPIs.active = null
    publicAPIs.items = []

    publicAPIs.open = function (panelName) {
      if (publicAPIs.active) {
        close(publicAPIs.active, currentView)
      }

      open(panelName, currentView)
    }

    publicAPIs.close = function (panelName) {
      close(panelName, currentView)
    }

    publicAPIs.closeAll = function () {
      views.forEach(view => {
        forOwn(publicAPIs.items[view], function (value, key) {
          close(key, view)
        })
      })
    }

    publicAPIs.init = function (groupName, options) {
      settings = merge(defaults, options || {})
      runTabby(groupName, settings)
    }

    publicAPIs.init(groupName, options)

    return publicAPIs
  }

  return BuildTabby
})(window, document)

/**
 * Search the DOM for all the instances of Tabs
 */
export const TabbyCats = (function () {
  const BuildTabbyCats = function () {
    let publicAPIs = {}

    // Private Methods
    function runTabbyCats () {
      const allItems = [...document.querySelectorAll('[data-tabby-group]')]

      allItems.forEach(trigger => {
        const groupName = trigger.dataset.tabbyGroup

        // Check if trigger is option is not empty
        // And the it's not already included in the tabs groups object
        if (
          groupName.length <= 0 ||
          publicAPIs.tabGroups.hasOwnProperty(groupName)
        ) {
          return
        }

        publicAPIs.tabGroups[groupName] = publicAPIs.addGroup(groupName)
      })
    }

    // Check if the group has a setting data attr in the DOM.
    // Extract those setting if it's valid JSON.
    function getSettings (groupName) {
      const settingsElement = document.querySelector(
        `[data-tabby-group-${groupName}]`
      )

      if (!settingsElement) return {}

      const settings =
        settingsElement.dataset[`tabbyGroup${upperFirst(groupName)}`]

      try {
        JSON.parse(settings)
      } catch (e) {
        return {}
      }

      return JSON.parse(settings)
    }

    // PublicAPIs
    publicAPIs.tabGroups = {}

    publicAPIs.addGroup = function (groupName) {
      return new Tabby(groupName, getSettings(groupName))
    }

    publicAPIs.init = function () {
      runTabbyCats()
    }

    publicAPIs.init()

    return publicAPIs
  }

  return BuildTabbyCats
})(window, document)

window.tabbyCatTabs = new TabbyCats()
