export const TabAccordion = (function(options) {
	let defaults = {

	}

	const BuildTabAccordion = function(options) {
		let publicAPIs = {}
		let settings;

		// Private Methods

		// PublicAPI
		publicAPIs.init = function(options) {
			settings = extend(defaults, options || {}); //lodash, combine options with the defaults, overriding defaults
		}

		publicAPIs.init(options);

		return publicAPIs;
	}

	return BuildTabAccordion;
})(window, document);
