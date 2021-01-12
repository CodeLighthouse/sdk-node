'use strict';

// IMPORTS
const WebClient = require('./lib/webclient');
const CodeLighthouseError = require('./lib/codelighthouse_error');
const domain = require('domain');

// SET THE ERROR STACK TRACE LIMIT TO 20 FRAMES
Error.stackTraceLimit = 20;


class CodeLighthouse {
	constructor(organization_name, api_key, default_email, options={}) {

		// CONFIGURE PROPERTIES
		this.organization_name = organization_name;
		this.api_key = api_key;
		this.default_email = default_email;			// TO SUPPORT GLOBAL UNCAUGHT EXCEPTIONS

		this.environment = options.environment ? options.environment : 'prod';
		this.resource_group = options.resource_group ? options.resource_group : null;
		this.resource_name = options.resource_name ? options.resource_name : null;
		this.github_repo = options.github_repo ? options.github_repo : null;
		this.enable_global_handler = options.enable_global_handler ? options.enable_global_handler : true;

		// SET UP WEB CLIENT
		let url, debug;
		if (this.environment === "local") {
			url = 'http://localhost:5000';
			debug = true;
		}
		else if (this.environment === 'dev') {
			url = 'https://dev.codelighthouse.io';
			debug = true;
		}
		else {
			url = 'https://codelighthouse.io';
			debug = false;
		}

		this.web_client = new WebClient(this.organization_name, this.api_key, url, 'v1', debug);

		// SET UP UNHANDLED EXCEPTION AND UNCAUGHT PROMISE REJECTION ERRORS
		if (this.enable_global_handler) {
			process.on("uncaughtException", err => {
				this.error(err, this.default_email);
			});
			process.on("unhandledRejection", err => {
				this.error(err, this.default_email);
			});
		}


		// SET UP INTEGRATIONS
		// NOTE: INTEGRATION FUNCTIONS MUST BE ARROW FUNCTIONS OR ELSE THE THIS POINTER WILL NOT WORK
		this.integrations = {
			express: {
				requestHandler: (request, response, next) => {
					const dom = domain.create();
					dom.on('error', next);
					return dom.run(next);
				},
				errorHandler: (error, request, response, next) => {
					this.error(error);
				}
			}
		}
	}

	// SEND THE ERROR TO OUR BACKEND
	error(error, email=this.default_email, data=null) {

		// CONSTRUCT AN ERROR
		const clh_error = new CodeLighthouseError(error, email, this.resource_group, this.resource_name,
			this.github_repo, data);

		// SEND THE ERROR
		this.web_client.send_error(clh_error.json());

	}



}

// EXPORT THE CODELIGHTHOUSE CLASS
module.exports = CodeLighthouse