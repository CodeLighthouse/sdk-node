---
tags: [node, sdk]
---

# CodeLighthouse's Node.js SDK

Welcome to CodeLighthouse's official documentation for our Node.js SDK! If you're looking for guidance on how to
install, configure, and/or integrate our SDK into your code, you're in the right place!

## Installing the SDK

The CodeLighthouse SDK is published on [npm](https://npmjs.org/package/codelighthouse), the Node.js package manager.

### Installing with npm

Installing the SDK with npm couldn't be easier!
Simply run:

```bash
npm install codelighthouse
```

## Configuring the SDK

Once you have installed the SDK, you need to import and configure it. Configuring the SDK requires signing up an account
at [codelighthouse.io](https://codelighthouse.io). Using CodeLighthouse for a small or personal project? No worries, we
offer a [free tier](https://codelighthouse.io/#pricing) subscription!

### SDK Configuration Options

The CodeLighthouse SDK has several configuration options that provide for current functionality and future
extensibility.
<!-- title: SDK Configuration Options -->

| Option                  | Value                                          | Required? |
|-------------------------|------------------------------------------------|-----------|
|`organization_name`      |The name of your organization when you signed up| yes       |
|`api_key`              |Your organization's API Key                     | yes       |
|`default_email`          | The email address of the user who owns the service | yes |
|`options`                 | An object containing additional options described below | no |

(More on this below)

#### Required Parameters

These options are required for your SDK to successfully authenticate to our server and to function properly.

* `organization_name`  - The name of your organization. After you sign up, this can be found in your
  [CodeLighthouse Admin Dashboard](https://codelighthouse.io/admin) on the
  [organization](https://codelighthouse.io/admin/organization) page. We recommend copying and pasting this value into
  the SDK to prevent typos.
* `api_key` - Your API key, registered when you sign up for your account. After you sign up, this can be found in
  your [CodeLighthouse Admin Dashboard](https://codelighthouse.io/admin) on the
  [organization](https://codelighthouse.io/admin/organization) page. We recommend copying and pasting this value into
  the SDK to prevent typos.
* `default_email` - The email address of the user in your CodeLighthouse organization who is responsible for the
  resource. All notifications for uncaught errors will be sent to this user. You can view and invite users to your
  organization in the [user management page](https://codelighthouse.io/admin/users) on your admin panel.

#### Optional Parameters

These values should be used as keys in the `options` object that is passed to the CodeLighthouse constructor.

The following options are used for organizing your resources and their errors. The specified values for each will be
included in your error notifications. When a function in a resource encounters an error, the code owner will be notified
of the resource group, resource name, environment, and function name where the error occurred. We anticipate being able
to filter errors and visualizations on the basis of these options in the near future.

* `resource_name` - The name of the resource that your code belongs to. This is used for tracking errors when you are
  using CodeLighthouse in multiple different projects or resources. This value is included in the error notifications
  you receive so that you know where the error ocurred. We also anticipate allowing you to filter your error feed by
  resource name, as well as offering error analytics and visualizations on a per-resource basis in the near future.
* `resource_group` - the name of the group or resources that this resource belongs to. Similar to `resource_name`, this
  is used for tracking errorss, and is included in the error notifications you receive. We expect to be able to allow
  you to filter and visualize errors on a per-`resource_group` basis as well.
* `enable_global_handler` - Toggles whether all uncaught errors should be reported to the email specified
  by `default_email`.

### Configuration Example

```javascript
// IMPORT CODELIGHTHOUSE
const CodeLighthouse = require('codelighthouse');

// CONFIGURE THE ERROR CATCHER
CodeLighthouse.configure(
	"CodeLighthouse, LLC",          // ORGANIZATION NAME
	"your API Key",                 // API KEY
	"code owner's email address",   // DEFAULT EMAIL
	{                               // ADDITIONAL OPTIONS
		resource_group: "serverless-applications",
		resource_name: "notifications-app"
	}
)
```

<!-- theme: warning -->

> ### Important!
> The CodeLighthouse SDK must be imported and configured in your application's entrypoint before importing any other
> modules that also use CodeLighthouse. Importing modules that use CodeLighthouse before configuring it may result in
> the module not working properly.

Once the module is imported and configured in your application's entrypoint, you can import it in other modules and
files without configuring it again:

```javascript
const CodeLighthouse = require('codelighthouse');
try {
	/* some code */
} catch (err) {

	/* some error handling code */
	CodeLighthouse.error(err)
}
```

## Using the SDK

Once you have configured the SDK, you have a few options on how to use it.

### The Global Handler

By default, the CodeLighthouse SDK will send error notifications for all uncaught exceptions and uncaught promise
rejections to the user specified by `default_email` in the configuration. To turn this off, set the
parameter `enable_global_handler` to `false`.

**Note that frameworks such as Express.js may handle errors that occur in routes, such that application errors will not
be caught by the global handler.** Please see the section on our Express.js integration for information on how to catch
errors within routes. Looking for a different framework? [Contact us](https://codelighthouse.io/contact).

### Manually Reporting Errors

You may be handling errors already with try/catch blocks, yet still wish to send error notifications to your code
owners. CodeLighthouse provides an easy way to do this:

```javascript
try {
	// YOUR CODE HERE
} catch (err) {
	const options = {
		// THE EMAIL OF A CODELIGHTHOUSE USER TO REPORT THE ERROR TO
		email: "example@codelighthouse.io",

		// ANY ADDITIONAL DATA YOU WISH TO REPORT
		data: {}
	}
	CodeLighthouse.error(err, options)
}
```

This particular example will notify the code owner specified by `email` in the configuration options.

Another great way to use this feature is to use it to report errors in different sections of code in the same
application to different code owners. Wrap each code owner's code in a try/catch block, and you're set! (Remember to be
careful - frameworks like Express may disrupt this if you wrap your try/catch blocks around entire routes.)

```javascript
try {
	// YOUR CODE HERE
} catch (err) {
	const options = {
		email: "an_email@your_company.com"
	}
	CodeLighthouse.error(err, options);
}
```

<!-- theme: warning -->

> ### Important!
> The email that you specify must belong to a user that has been added to your CodeLighthouse organization, or else the
> notification will not be sent.

When you're sending errors manually using this method, you can also optionally attach additional data that will show up
in the admin panel in the error view. The most common use case for this is including additional information that will
help your developers to identify and debug the error. For example, you could attach information about the currently
logged-in user that experienced the error, connection information, or other application state information.

```javascript
try {
	// YOUR CODE HERE
} catch (err) {
	const options = {
		email: "an_email@your_company.com",
		data: {

			// EXAMPLE DATA
			user: user_data,
			session_id: sessionid
		}
	}
	CodeLighthouse.error(err, options);
}
```

Make sure that the data you're passing via the `data` argument can be serialized into JSON. Object literals and native
types will work easily, but if you choose to pass a more complicated object, ensure that it is serializable to JSON and
that it does not contain any circular references.

### Express.js Integration

While Express.js has the potential to distrupt some SDK functionalities as described above, it also presented an
opportunity for integration. The SDK currently has two methods that allow for integration into Express:

```javascript
const CodeLighthouse = require('codelighthouse');
CodeLighthouse.configure(
        "CodeLighthouse, LLC",          // ORGANIZATION NAME
        "your API Key",                 // API KEY
        "code owner's email address",   // DEFAULT EMAIL
        {                               // ADDITIONAL OPTIONS
          resource_group: "serverless-applications",
          resource_name: "notifications-app"
        }
)
const app = express();

// NOTE: THIS MUST BE THE FIRST PIECE OF MIDDLEWARE IN THE APP
app.use(CodeLighthouse.integrations.express.requestHandler);

// YOUR ROUTES AND MIDDLEWARE HERE
app.route("/", (request, response, next) => {
	// CODE HERE
});

// NOTE: THIS NEEDS TO GO AFTER YOUR ROUTES, AND BEFORE OTHER ERROR HANDLERS
app.use(CodeLighthouse.integrations.express.errorHandler);
```

Note that the `requestHandler` must come **before** your routes and other middlewares, and the `errorHandler` must
come **after** your other routes andmiddleware, but **before** other error handlers.

Also note that the SDK will call `next()` after handling the error.

### Adding Additional Users

You can invite additional users to your organization in your admin panel on the
[user management page](https://codelighthouse.io/admin/users). Note that each payment plan only comes with a fixed
number of users, and that adding additional users past that number will cost more. Please refer to our
[pricing guide](https://codelighthouse.io/#pricing) for more information.

## Examples

CodeLighthouse's SDK is built with pure Node.js and will work with any native Node.js framework.

### Standard Node.js

The example below is for normal Node.js code. This particular example is for an AWS Lambda:

```javascript
// IMPORT CODELIGHTHOUSE
const CodeLighthouse = require('codelighthouse');

// CONFIGURE THE SDK, SENDING UNCAUGHT EXCEPTIONS AND PROMISE REJECTIONS TO doesnotexist@codelighthouse.io
CodeLighthouse.configure(
	"CodeLighthouse, LLC",          // ORGANIZATION NAME
	"your API Key",                 // API KEY
	"doesnotexist@codelighthouse.io",   // DEFAULT EMAIL
	{                               // ADDITIONAL OPTIONS
		resource_group: "serverless-applications",
		resource_name: "notifications-app"
	}
)

// HANDLER
async function handle(event, context) {


	// THIS EXCEPTION IS UNCAUGHT, SO THE DEFAULT USER WILL BE NOTIFIED
	if (event.someCondition) {
		throw new ReferenceError();
	}

	// OR, CATCH AN ERROR AND SEND IT TO THE NON-DEFAULT USER
	try {
		// SOME CODE
		date = new Date();
	} catch (err) {

		// THIS ERROR NOTIFICATION WILL GO TO hello@codelighthouse.io INSTEAD OF THE DEFAULT
		CodeLighthouse.error(err, "hello@codelighthouse.io")
		date = "no date available";
	}
	return new Date();
} 
```

### Express.js

The example below is for Express.js code.

```javascript
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');

// IMPORT CODELIGHTHOUSE
const CodeLighthouse = require('codelighthouse');

// CONFIGURE THE SDK, SENDING UNCAUGHT EXCEPTIONS AND PROMISE REJECTIONS TO doesnotexist@codelighthouse.io
CodeLighthouse.configure(
	"CodeLighthouse, LLC",          // ORGANIZATION NAME
	"your API Key",                 // API KEY
	"code owner's email address",   // DEFAULT EMAIL
	{                               // ADDITIONAL OPTIONS
		resource_group: "serverless-applications",
		resource_name: "notifications-app"
	}
)

var app = express();

console.log('running');

// GOES BEFORE MIDDLEWARE AND ROUTES
app.use(CodeLighthouse.integrations.express.requestHandler)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// AN APP ROUTE
app.get('/', (request, response, next) => {
	response.send("hello, world!");
});

app.get('/error', (request, response, next) => {
	console.log('route');

	// res IS UNDEFINED, WILL THROW AN ERROR CAUGHT BY CODELIGHTHOUSE AND SENT TO THE DEFAULT USER
	res.render('index', {title: 'Express'});
})

// ROUTES FROM A CONTROLLER SOMEWHERE ELSE
app.use('/users', usersRouter);

// GOES AFTER MIDDLEWARE AND ROUTES
app.use(CodeLighthouse.integrations.express.errorHandler)

module.exports = app;

```
