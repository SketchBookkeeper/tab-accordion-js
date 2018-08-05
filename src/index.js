//--------------------------------------------------------------
// TAB ACCORDION
// @author Paul Allen
//--------------------------------------------------------------
import merge from 'lodash/merge';
import debounce from 'lodash/debounce';
import upperFirst from 'lodash/upperFirst';

//------------------------------
// Tabby
// Make Tabs
//------------------------------
const Tabby = (function() {
	let defaults = {
		'activeTriggerClass' : 'is-active',
		'activeContentClass' : 'is-active',
		'deepLinking' : true,
		'hidePanels' : true,
		'breakpoint' : 960,
	}

	const BuildTabby = function(groupName, options) {
		let publicAPIs = {}
		let settings;
		let currentView = 'accordion'; // tab || accordion

		// Private Methods
		function runTabby(groupName, options) {
			publicAPIs.triggers = sortTriggers(collectTriggers(groupName));
			checkView();
			bindEvents(groupName);
		}

		// TODO Make setup aria function

		// Add all the needed event listeners
		function bindEvents(groupName) {
			// Click Events
			window.addEventListener('click', e => {
				const el = e.target.closest(`[data-tabby-group="${groupName}"]`);
				if (!el) return;

				publicAPIs.open(el.dataset.tabbyPanel);
			});

			// Resize
			// window.addEventListener('resize', );
		}

		// Check the viewport and determine if current view should be tabs or accordions
		function checkView() {
			if (window.innerWidth < settings.breakpoint) {
				currentView = 'accordion';
			} else {
				currentView = 'tab';
			}
		}

		function collectTriggers(groupName) {
			return [...document.querySelectorAll(`[data-tabby-group="${groupName}"]`)];
		}

		// Sort and cache the triggers into types, tab or accordion.
		// Function will assume the elements found in the DOM first are tabs,
		// followed by accordion triggers.
		// This behavior can be changed by providing a type on the trigger element
		// i.e. data-tabby-trigger-type="accordion"
		function sortTriggers(triggers) {
			const sortedTriggers = {
				'tab' : {},
				'accordion' : {}
			};

			triggers.forEach(trigger => {
				let group = 'tab'; // Group name
				const panelName = trigger.dataset.tabbyPanel;

				// Sort to accordion if tab for panel is already present
				if (sortedTriggers.tab.hasOwnProperty(panelName)) group = 'accordion';
				// Allow Developer to override for unique layouts
				if(trigger.dataset.tabbyTriggerType) group = trigger.dataset.tabbyTriggerType

				sortedTriggers[group][panelName] = {
					'el' : trigger,
					'panel' : document.getElementById(panelName)
				}
			});

			return sortedTriggers;
		}

		// Open the panel and give the trigger the needed attributes
		function open(panelName, type) {
			// Check if we have valid parameters
			if (
				!publicAPIs.triggers[type].hasOwnProperty(panelName) ||
				!publicAPIs.triggers[type][panelName].hasOwnProperty('el') ||
				!publicAPIs.triggers[type][panelName].hasOwnProperty('panel')
			) return;

			const panelObject = publicAPIs.triggers[type][panelName];
			const triggerElement = panelObject.el;
			const panelElement = panelObject.panel;

			// The aria attribute that identifies an open panel is based on type
			// tabs are expecting 'aria-selected' while accordion needs 'aria-expanded'
			const ariaSelected = type === 'tab' ? 'aria-selected' : 'aria-expanded';

			// Select the Trigger
			triggerElement.classList.add(settings.activeTriggerClass);
			triggerElement.setAttribute(ariaSelected, true);

			// Open the Panel
			panelElement.classList.add(settings.activeContentClass);
			// Developer may choose to use active class to display panel,
			// rather than let the plugin set the display.
			if (settings.hidePanels) {
				panelElement.style.display = 'block';
			}

			// Update the API
			publicAPIs.active = panelObject;
		}

		// PublicAPIs

		// Set defaults
		publicAPIs.active = {};
		publicAPIs.triggers = [];

		publicAPIs.open = function(panelName) {
			open(panelName, currentView)
		}

		publicAPIs.close = function(panelName) {

		}

		publicAPIs.init = function(groupName, options) {
			settings = merge(defaults, options || {});
			runTabby(groupName, settings);
		}

		publicAPIs.init(groupName, options);

		return publicAPIs;
	}

	return BuildTabby;
})(window, document);


//------------------------------
// TabbyCats
// Search the DOM for all the instances of Tabs
//------------------------------
const TabbyCats = (function() {
	const BuildTabbyCats = function() {
		let publicAPIs = {}

		// Private Methods
		function runTabbyCats() {
			const allTriggers = [...document.querySelectorAll('[data-tabby-group]')];

			allTriggers.forEach(trigger => {
				const groupName = trigger.dataset.tabbyGroup;

				// Check if trigger is option is not empty
				// And the it's not already included in the tabs groups object
				if (
					groupName.length <= 0 ||
					publicAPIs.tabGroups.hasOwnProperty(groupName)
				) return;

				publicAPIs.tabGroups[groupName] = publicAPIs.addGroup(groupName)
			});
		}

		// Check if the group has a setting data attr in the DOM.
		// Extract those setting if it's valid JSON.
		function getSettings(groupName) {
			const settingsElement = document.querySelector(`[data-tabby-group-${groupName}]`);

			if (!settingsElement) return {};

			const settings = settingsElement.dataset[`tabbyGroup${upperFirst(groupName)}`]

			try {
				JSON.parse(settings);
			} catch (e) {
				return {};
			}

			return JSON.parse(settings);
		}

		// PublicAPIs
		publicAPIs.tabGroups = {};

		publicAPIs.addGroup = function(groupName) {
			return new Tabby(groupName, getSettings(groupName));
		}

		publicAPIs.init = function() {
			runTabbyCats();
		}

		publicAPIs.init();

		return publicAPIs;
	}

	return BuildTabbyCats;
})(window, document);

window.tabbyCatTabs = new TabbyCats();
