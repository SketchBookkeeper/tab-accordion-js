import upperFirst from 'lodash/upperFirst'
import { TabAccordion } from './TabAccordion'

/**
 * Tab Accordions
 */
export const TabAccordions = (function () {
  const BuildTabbyCats = function () {
    let publicAPIs = {}

    // Private Methods
    function runTabbyCats () {
      // Search the DOM for all the instances of Tabs
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

    //
    // PublicAPIs
    //

    publicAPIs.tabGroups = {}

    publicAPIs.addGroup = function (groupName) {
      return new TabAccordion(groupName, getSettings(groupName))
    }

    publicAPIs.init = function () {
      runTabbyCats()
    }

    publicAPIs.init()

    return publicAPIs
  }

  return BuildTabbyCats
})(window, document)
