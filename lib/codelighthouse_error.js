const stackTraceParser = require('stacktrace-parser');

class CodeLighthouseError {

	// CONSTRUCT THE OBJECT
	constructor (error, email,  resource_group=null, resource_name=null,
				 github_repo=null, user_data=null) {

		// HAVE TO USE AN OBJECT LITERAL TO STORE DATA - WOULD STORE ALL AT CLASS LEVEL, BUT SOME ARE
		// RESERVED WORDS (LIKE ARGUMENTS AND FUNCTION) SO CAN'T DIRECTORY STORE ON this
		this.data = {
			'error_type': error.name,
			'description': error.message,
			'email': email,
			'github_repo': github_repo,
			'resource_group': resource_group,
			'resource_name': resource_name
			'user_data': user_data
		}

		// ADD THE STACK TRACE
		const formatted_trace = [];
		const parsed_stack_trace = stackTraceParser.parse(error.stack);
		for (let trace of parsed_stack_trace) {
			formatted_trace.push({
				'file': trace.file,
				'line': '',        // NOT AVAILABLE IN JAVASCRIPT
				'lineno': trace.lineNumber,
				'function': trace.methodName
			})
		}
		this.data['stack_trace'] = error.stack;

		// ADD METHOD NAME AND ARGUMENTS OF TOP-LEVEL ERROR
		this.data['arguments'] = parsed_stack_trace[0].arguments;    // ARGUMENTS IS A RESERVED WORD SO DO IT THIS WAY
		this.data['function'] = parsed_stack_trace[0].methodName;

	}

	// GET JSON OF THE ERROR
	json() {
		return JSON.stringify(this.data);
	}
}

module.exports = CodeLighthouseError