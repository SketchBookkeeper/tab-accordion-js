import merge from 'lodash/merge'
import debounce from 'lodash/debounce'
import forOwn from 'lodash/forOwn'

/**
 *Tab Accordion
 */
export const TabAccordion = (function () {
  let defaults = {
    activeTriggerClass: 'active',
    activeContentClass: 'active',
    deepLinking: true,
    hidePanels: true,
    hideTabs: true,
    hideAccordions: true,
    breakpoint: 960,
    type: false
  }

  const BuildTabs = function (groupName, options) {
    const views = ['tab', 'accordion']
    let publicAPIs = {}
    let settings

    // Check if user defined a type 'accordion' or 'tab'
    // Otherwise set the value.
    let currentView = options.type || 'accordion'

    // Private Methods
    function runTabs (groupName, options) {
      publicAPIs.items = sortItems(collectItems(groupName))
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

      setView()

      if (options.deepLinking) {
        checkForHashOnLoad()
      }
    }

    // Handle clicks
    function bindClickEvents (groupName) {
      window.addEventListener('click', e => {
        const el = e.target.closest(`[data-tabby-group="${groupName}"]`)
        if (!el) return

        const panelName = el.dataset.tabbyPanel

        publicAPIs.open(panelName)

        if (settings.deepLinking) {
          window.location.hash = panelName
        }
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
      }, 100))
    }

    function checkForHashOnLoad () {
      if (window.location.hash) {
        const maybePanelName = window.location.hash.replace('#', '')

        publicAPIs.open(maybePanelName)
      }
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
      addAccordionAria()

      if (settings.hideTabs) {
        toggleTriggers('tab', 'none')
      }

      if (settings.hideAccordions) {
        toggleTriggers('accordion', 'block')
      }
    }

    // Prepare the tab view
    // Get the first tab and open it.
    function setUpTabs () {
      publicAPIs.closeAll()
      addTabAria()

      const firstTab = Object.keys(publicAPIs.items['tab'])[0]

      open(firstTab, 'tab')

      if (settings.hideTabs) {
        toggleTriggers('tab', 'block')
      }

      if (settings.hideAccordions) {
        toggleTriggers('accordion', 'none')
      }
    }

    // Toggle the tiggers' display based on passed display value
    function toggleTriggers (type, displayValue) {
      forOwn(publicAPIs.items[type], function (value, key) {
        value.el.style.display = displayValue
      })
    }

    function collectItems (groupName) {
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

    // Accordion Aria labels
    function addAccordionAria () {
      forOwn(publicAPIs.items['accordion'], function (value, key) {
        value.el.setAttribute('aria-controls', value.panel.id)
      })
    }

    // Tab Aria labels
    function addTabAria () {
      forOwn(publicAPIs.items['tab'], function (value, key) {
        const panelId = value.panel.id

        value.el.setAttribute('aria-controls', panelId)
        value.el.id = `${panelId}-tab`

        value.panel.setAttribute('role', 'tabpanel')
        value.panel.setAttribute('aria-labeledby', `${panelId}-tab`)
      })
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

      // Update the API
      publicAPIs.active = panelName

      // Developer may choose to use active class to display panel,
      // rather than let the plugin set the display.
      if (settings.hidePanels) {
        panelElement.style.display = 'block'
      }
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

    //
    // PublicAPIs
    //

    // Set defaults
    publicAPIs.active = null
    publicAPIs.items = []

    // Open
    publicAPIs.open = function (panelName) {
      if (publicAPIs.active) {
        close(publicAPIs.active, currentView)
      }

      open(panelName, currentView)
    }

    // Close
    publicAPIs.close = function (panelName) {
      close(panelName, currentView)
    }

    // Close 'em all
    publicAPIs.closeAll = function () {
      views.forEach(view => {
        forOwn(publicAPIs.items[view], function (value, key) {
          close(key, view)
        })
      })
    }

    publicAPIs.init = function (groupName, options) {
      settings = merge(defaults, options || {})

      window.addEventListener('load', e => {
        runTabs(groupName, settings)
      })
    }

    publicAPIs.init(groupName, options)

    return publicAPIs
  }

  return BuildTabs
})(window, document)
