import upperFirst from 'lodash/upperFirst'
import { TabAccordion } from './TabAccordion'

/**
 * Tab Accordions
 */
export const TabAccordions = (function () {
  const BuildTabs = function () {
    let publicAPIs = {}

    // Private Methods
    function runTabs () {
      // Search the DOM for all the instances of Tabs
      const allItems = [...document.querySelectorAll('[data-tab-group]')]

      allItems.forEach(trigger => {
        const groupName = trigger.dataset.tabGroup

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
        `[data-tab-group-${groupName}]`
      )

      if (!settingsElement) return {}

      const settings =
        settingsElement.dataset[`tabGroup${upperFirst(groupName)}`]

      try {
        JSON.parse(settings)
      } catch (e) {
        return {}
      }

      return JSON.parse(settings)
    }

    //
    // PublicAPIs
    //

    publicAPIs.tabGroups = {}

    publicAPIs.addGroup = function (groupName) {
      return new TabAccordion(groupName, getSettings(groupName))
    }

    publicAPIs.init = function () {
      runTabs()
    }

    publicAPIs.init()

    return publicAPIs
  }

  return BuildTabs
})(window, document)
