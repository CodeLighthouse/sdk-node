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

Or, to make sure you add it to your `package.json` as well, run:
```bash
npm install codelighthouse -s
```

## Configuring the SDK
Once you have installed the SDK, you need to import and configure it. Configuring the SDK requires signing up an 
account at [codelighthouse.io](https://codelighthouse.io). Using CodeLighthouse for a small or personal project? No 
worries, we offer a [free tier](https://codelighthouse.io/#pricing) subscription!

### SDK Configuration Options
The CodeLighthouse SDK has several configuration options that provide for current functionality and future 
extensibility. 
<!-- title: SDK Configuration Options -->
| Option                  | Value                                          | Required? |
|-------------------------|------------------------------------------------|-----------|
|`organization_name`      |The name of your organization when you signed up| yes       |
|`api_key`              |Your organization's API Key                     | yes       |
|`default_email`          | The email address of the user who owns the service \*| yes |
|`resource_name`          |The name of the resource you are embedding the SDK into| no|
|`resource_group`         |The group of resources that the resource you are embedding the SDK into belongs to| no |
|`enable_global_handler`| Toggles whether uncaught errors should be reported to the user specified by `default_email`. Default: `true`|no
\* More on this later

#### Required Parameters
These options are required for your SDK to successfully authenticate to our server and to function properly.
* `organization_name`  - The name of your organization. After you sign up, this can be found in your 
[CodeLighthouse Admin Dashboard](https://codelighthouse.io/admin) on the 
[organization](https://codelighthouse.io/admin/organization) page. We recommend copying and pasting this value into the 
SDK to prevent typos.
* `api_key` - Your API key, registered when you sign up for your account. After you sign up, this can be found in 
your [CodeLighthouse Admin Dashboard](https://codelighthouse.io/admin) on the 
[organization](https://codelighthouse.io/admin/organization) page. We recommend copying and pasting this value into the 
SDK to prevent typos.
* `default_email` - The email address of the user in your CodeLighthouse organization who is responsible for the resource. All notifications for uncaught errors will be sent to this user. You can view and invite users to your organization in the [user management page](https://codelighthouse.io/admin/users) on your admin panel. 


#### Optional Options
The following options are used for organizing your resources and their errors. The specified values for each will be 
included in your error notifications. When a function in a resource encounters an error, the code owner will be 
notified of the resource group, resource name, environment, and function name where the error ocurred. We anticipate 
being able to filter errors and visualizations on the basis of these options in the near future.

* `resource_name` - The name of the resource that your code belongs to. This is used for tracking errors when you are 
using CodeLighthouse in multiple different projects or resources. This value is included in the error notifications you 
receive so that you know where the error ocurred. We also anticipate allowing you to filter your error feed by resource 
name, as well as offering error analytics and visualizations on a per-resource basis in the near future. 
* `resource group` - the name of the group or resources that this resource belongs to. Similar to `resource_name`, this 
is used for tracking errorss, and is included in the error notifications you receive. We expect to be able to allow you 
to filter and visualize errors on a per-`resource_group` basis as well. 
* `enable_global_handler` - Toggles whether all uncaught errors should be reported to the email specified by `default_email`.

### Configuration Example
```javascript
// IMPORT CODELIGHTHOUSE
const CodeLighthouse = require('codelighthouse');

// INSTANTIATE THE ERROR CATCHER
const codelighthouse = new CodeLighthouse(
    organization_name="CodeLighthouse, LLC",
    api_key="your API Key",
    default_email="code owner's email address"
    resource_group="serverless-applications",
    resource_name="notifications-app"
)
```

## Using the SDK
Once you have configured the SDK, you have a few options on how to use it. 

### The Global Handler
By default, the CodeLighthouse SDK will send error notifications for all uncaught exceptions and uncaught promise rejections to the user specified by `default_email` in the configuration. To turn this off, set the parameter `enable_global_handler` to `true`.

**Note that frameworks such as Express.js may handle errors that occur in routes, such that application errors will not be caught by the global handler.** Please see the section on our Express.js integration for information on how to catch errors within routes. Looking for a different framework? [Contact us](https://codelighthouse.io/contact).

### Manually Reporting Errors
You may be handling errors already with try/catch blocks,  yet still wish to send error notifications to your code owners. CodeLighthouse provides an easy way to do this:

```javascript
try {
  // YOUR CODE HERE
}
catch (err) {
  codelighthouse.error(err)
}
```
This particular example will notify the code owner specified by `default_email` in the configuration options.

Another great way to use this feature is to use it to report errors in different sections of code in the same application to different code owners. Wrap each code owner's code in a try/catch block, and you're set! (Remember to be careful - frameworks like Express may disrupt this if you wrap your try/catch blocks around entire routes.)

```javascript
try {
  // YOUR CODE HERE
}
catch (err) {
  codelighthouse.error(err, "an_email@your_company.com");
}
```

### Express.js Integration
While Express.js has the potential to distrupt some SDK functionalities as described above, it also presented an opportunity for integration. The SDK currently has two methods that allow for integration into Express:

```javascript
const app = express();

// NOTE: THIS MUST BE THE FIRST PIECE OF MIDDLEWARE IN THE APP
app.use(codelighthouse.integrations.express.requestHandler);

// YOUR ROUTES AND MIDDLEWARE HERE
app.route("/", (request, response, next) => {
  // COD EHERE
});

// NOTE: THIS NEEDS TO GO AFTER YOUR ROUTES, AND BEFORE OTHER ERROR HANDLERS
app.use(codelighthouse.integrations.express.errorHandler);
```

Note that the `requestHandler` must come **before** your routes and other middlewares, and the `errorHandler` must come **after** your other routes andmiddleware, but **before** other error handlers. 

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
const codelighthouse = new CodeLighthouse(
    organization_name="CodeLighthouse, LLC",
    api_key="your API Key",
    default_email="doesnotexist@codelighthouse.io" 
    resource_group="serverless-applications",
    resource_name="notifications-app"
)

// HANDLER
async function handle(event, context) {

    // YOUR CODE HERE
    let date;

    // THIS EXCEPTION IS UNCAUGHT, SO THE DEFAULT USER WILL BE NOTIFIED
    if (event.someCondition) {
      throw new ReferenceError();
    }

    // OR, CATCH AN ERROR AND SEND IT TO THE NON-DEFAULT USER
    try {
      // SOME CODE
      date = new Date();
    }
    catch (err) {

      // THIS ERROR NOTIFICATION WILL GO TO hello@codelighthouse.io INSTEAD OF THE DEFAULT
      codelighthouse.error(err, "hello@codelighthouse.io")
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
const codelighthouse = new CodeLighthouse(
    organization_name="CodeLighthouse, LLC",
    api_key="your API Key",
    default_email="doesnotexist@codelighthouse.io" 
    resource_group="serverless-applications",
    resource_name="notifications-app"
)

var app = express();

console.log('running');

// GOES BEFORE MIDDLEWARE AND ROUTES
app.use(codelighthouse.integrations.express.requestHandler)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.use(codelighthouse.integrations.express.errorHandler)

module.exports = app;

```
