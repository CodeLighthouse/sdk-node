'use strict';

// IMPORTS
const WebClient = require('./lib/webclient');
const CodeLighthouseError = require('./lib/codelighthouse_error');

// SET THE ERROR STACK TRACE LIMIT TO 20 FRAMES
Error.stackTraceLimit = 20;


class CodeLighthouse {

	constructor(organization_name, api_key, default_email, environment='prod', resource_group=null, resource_name=null,
				github_repo=null) {

		// CONFIGURE PROPERTIES
		this.organization_name = organization_name;
		this.api_key = api_key;
		this.default_email = default_email;			// TO SUPPORT GLOBAL UNCAUGHT EXCEPTIONS
		this.environment = environment;
		this.resource_group = resource_group;
		this.resource_name = resource_name;
		this.github_repo = github_repo;

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
		process.on("uncaughtException", err => {
			this.error(err, this.default_email);
		});
		process.on("unhandledRejection", err => {
			this.error(err, this.default_email);
		});

	}

	error(error, email) {

		// CONSTRUCT AN ERROR
		const clh_error = new CodeLighthouseError(error, email, this.resource_group, this.resource_name,
			this.github_repo);

		console.log(clh_error.json())

		// SEND THE ERROR
		this.web_client.send_error(clh_error.json());


	}


}

// EXPORT THE CODELIGHTHOUSE CLASS
module.exports = CodeLighthouse