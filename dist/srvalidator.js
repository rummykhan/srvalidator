/**
 * srvalidator v1.1.7
 * (c) 2017 Rehan Manzoor
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.srvalidator = factory());
}(this, (function () { 'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var validUrl = createCommonjsModule(function (module) {
(function(module) {
    'use strict';

    module.exports.is_uri = is_iri;
    module.exports.is_http_uri = is_http_iri;
    module.exports.is_https_uri = is_https_iri;
    module.exports.is_web_uri = is_web_iri;
    // Create aliases
    module.exports.isUri = is_iri;
    module.exports.isHttpUri = is_http_iri;
    module.exports.isHttpsUri = is_https_iri;
    module.exports.isWebUri = is_web_iri;


    // private function
    // internal URI spitter method - direct from RFC 3986
    var splitUri = function(uri) {
        var splitted = uri.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);
        return splitted;
    };

    function is_iri(value) {
        if (!value) {
            return;
        }

        // check for illegal characters
        if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(value)) { return; }

        // check for hex escapes that aren't complete
        if (/%[^0-9a-f]/i.test(value)) { return; }
        if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) { return; }

        var splitted = [];
        var scheme = '';
        var authority = '';
        var path = '';
        var query = '';
        var fragment = '';
        var out = '';

        // from RFC 3986
        splitted = splitUri(value);
        scheme = splitted[1]; 
        authority = splitted[2];
        path = splitted[3];
        query = splitted[4];
        fragment = splitted[5];

        // scheme and path are required, though the path can be empty
        if (!(scheme && scheme.length && path.length >= 0)) { return; }

        // if authority is present, the path must be empty or begin with a /
        if (authority && authority.length) {
            if (!(path.length === 0 || /^\//.test(path))) { return; }
        } else {
            // if authority is not present, the path must not start with //
            if (/^\/\//.test(path)) { return; }
        }

        // scheme must begin with a letter, then consist of letters, digits, +, ., or -
        if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase()))  { return; }

        // re-assemble the URL per section 5.3 in RFC 3986
        out += scheme + ':';
        if (authority && authority.length) {
            out += '//' + authority;
        }

        out += path;

        if (query && query.length) {
            out += '?' + query;
        }

        if (fragment && fragment.length) {
            out += '#' + fragment;
        }

        return out;
    }

    function is_http_iri(value, allowHttps) {
        if (!is_iri(value)) {
            return;
        }

        var splitted = [];
        var scheme = '';
        var authority = '';
        var path = '';
        var port = '';
        var query = '';
        var fragment = '';
        var out = '';

        // from RFC 3986
        splitted = splitUri(value);
        scheme = splitted[1]; 
        authority = splitted[2];
        path = splitted[3];
        query = splitted[4];
        fragment = splitted[5];

        if (!scheme)  { return; }

        if(allowHttps) {
            if (scheme.toLowerCase() != 'https') { return; }
        } else {
            if (scheme.toLowerCase() != 'http') { return; }
        }

        // fully-qualified URIs must have an authority section that is
        // a valid host
        if (!authority) {
            return;
        }

        // enable port component
        if (/:(\d+)$/.test(authority)) {
            port = authority.match(/:(\d+)$/)[0];
            authority = authority.replace(/:\d+$/, '');
        }

        out += scheme + ':';
        out += '//' + authority;
        
        if (port) {
            out += port;
        }
        
        out += path;
        
        if(query && query.length){
            out += '?' + query;
        }

        if(fragment && fragment.length){
            out += '#' + fragment;
        }
        
        return out;
    }

    function is_https_iri(value) {
        return is_http_iri(value, true);
    }

    function is_web_iri(value) {
        return (is_http_iri(value) || is_https_iri(value));
    }

})(module);
});

/**
 * Copyright (c) 2017 Rummy Khan
 *
 * This module provides support for validation forms using react.
 * This works because any change in state will cause the render function to execute.
 */

var Validator = function Validator() {
  this.errorMessagesBag = {};
};

// Final Method of React Validator.
Validator.prototype.validateAll = function validateAll (values) {
    var this$1 = this;


  values = values || this.values;

  return new Promise(function (resolve, reject) {

    this$1.refresh(values);

    if (Object.keys(this$1.errorMessagesBag).length === 0) {
      resolve({
        success: true,
        data: values
      });
    } else {
      reject({
        success: false,
        data: values,
        errors: this$1.errorMessagesBag
      });
    }
  });
};

// Method for backward compatibility.
Validator.prototype.validate = function validate (values, rules, alias, messages) {

  this.init(values, rules, alias, messages);
  return this.refresh(values);
};

// Initialize the object with values, rules, alias, messages
Validator.prototype.init = function init (values, rules, alias, messages) {
  this.values = values || {};
  this.rules = rules || {};
  this.alias = alias || {};
  this.messages = messages || [];
};

// refresh validation.
Validator.prototype.refresh = function refresh (values) {
    var this$1 = this;


  values = values || this.values;

  // iterate over form values.
  for (var key in values) {

    if (!this$1.values.hasOwnProperty(key)) {
      continue;
    }

    // get the value by key.
    var value = values[key];

    // get the rules corresponding to the form field.
    var rules = Validator.getRules(key, this$1.rules);

    // if rule is not present just skip the validation for that form field.
    if (!rules) {
      return;
    }

    // validate each field on the given rules
    // Split the rules by pipe '|'
    this$1.validateSingleValue(key, value, rules.split('|'), this$1.alias[key]);
  }

  return this.passes();
};

Validator.prototype.passes = function passes () {
  // It determines the validation is passed or failed by checking the error message bag.
  return Object.keys(this.errorMessagesBag).length === 0;
};

Validator.prototype.isValid = function isValid () {
  // An Alias to method passes
  return this.passes();
};

Validator.prototype.getMessages = function getMessages () {
  // Get Error message bag.
  return this.errorMessagesBag;
};

// Validate A Single Form Value against the rules.
Validator.prototype.validateSingleValue = function validateSingleValue (name, value, rules, alias, messages) {
    var this$1 = this;
    if ( messages === void 0 ) messages = [];


  // if rule is by chance an empty string
  if (!rules) {
    throw new Error('Rules are not present.');
  }

  // Iterate over rules to validate each rule one by one over a value.
  rules.forEach(function (rule) {
    this$1.validateSingleRule(name, value, rule, alias);
  });
};

// Validate a single value over a single rule.
Validator.prototype.validateSingleRule = function validateSingleRule (name, value, rule, alias) {

  // get Rule Name to method.
  rule = Validator.toClassRule(rule);

  // Initialize the parameters to null..
  var parameters = null;

  // Checks if rule contains parameters
  // If it is separate rule and parameters
  if (Validator.hasParameters(rule)) {
    // Get parameter from composite rule string.
    parameters = Validator.getParameters(rule);

    // Get Rule from composite rule string
    rule = Validator.separateRuleFromParameter(rule);
  }

  try {
    // This is wrapped inside Try-Catch Block just to avoid the check if method exists or not.
    this[rule](name, value, parameters, alias);
  } catch (e) {

    // If validation method against that rule doesn't exist. Throw Exception.
    throw new Error((rule + " is not a Validator."));
  }
};

// Require validate method.
Validator.prototype.validateRequired = function validateRequired (name, value, parameters, alias) {
    if ( parameters === void 0 ) parameters = null;


  alias = Validator.assertAlias(name, alias);

  var message = alias + " is required.";

  // To fix !!0 issue.
  if (Number.isInteger(value)) {
    return;
  }

  // If value is empty, add validation message.
  if (!value) {
    this.addValidationMessages(name, message);
  } else {

    // If value is not empty remove validation message.
    this.removeValidationMessage(name, message);
  }
};

// Validate Valus is integer or not.
Validator.prototype.validateInt = function validateInt (name, value, parameters, alias) {
    if ( parameters === void 0 ) parameters = null;


  alias = Validator.assertAlias(name, alias);

  value = parseInt(value, 10);

  var message = alias + " should be a number.";

  // Checks if number is integer.
  if (!Number.isInteger(value)) {
    // Add Validation messages.
    this.addValidationMessages(name, message);
  } else {
    // remove validation messages
    this.removeValidationMessage(name, message);
  }
};

// Validate email address.
Validator.prototype.validateEmail = function validateEmail (name, value, parameters, alias) {
    if ( parameters === void 0 ) parameters = null;

  alias = Validator.assertAlias(name, alias);

  var message = "Please enter a valid email address.";

  var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!pattern.test(value)) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Check if value is array or not.
Validator.prototype.validateArray = function validateArray (name, value, parameters, alias) {
    if ( parameters === void 0 ) parameters = null;

  alias = Validator.assertAlias(name, alias);

  var message = alias + " is not a valid array.";

  if (!value || !value.constructor || value.constructor !== Array) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Check if value is valid string.
Validator.prototype.validateString = function validateString (name, value, parameters, alias) {
    if ( parameters === void 0 ) parameters = null;


  alias = Validator.assertAlias(name, alias);

  var message = alias + " is not a valid string.";
  if (typeof value !== 'string') {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Check if value is greater than the given value.
Validator.prototype.validateGte = function validateGte (name, value, benchmark, alias) {
  alias = Validator.assertAlias(name, alias);

  value = parseInt(value, 10);
  benchmark = parseInt(benchmark, 10);

  if (isNaN(benchmark)) {
    throw new Error((benchmark + " is not a valid integer."));
  }

  var message = alias + " must be greater than " + benchmark + ".";

  if (value < benchmark) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Checks if value is less than the given value.
Validator.prototype.validateLte = function validateLte (name, value, benchmark, alias) {
  alias = Validator.assertAlias(name, alias);

  value = parseInt(value, 10);
  benchmark = parseInt(benchmark, 10);

  if (isNaN(benchmark)) {
    throw new Error((benchmark + " is not a valid integer."));
  }

  var message = alias + " must be less than " + benchmark + ".";

  if (value > benchmark) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Checks if value satisfies the given rule by minimum
Validator.prototype.validateMin = function validateMin (name, value, length, alias) {

  // If value is undefined no need to validate.
  if (typeof value === 'undefined') {
    return;
  }

  // If value is string apply character validation.
  if (typeof value === 'string') {
    return this.validateStringMin(name, value, length, alias);
  }

  // If value is number apply number validation.
  if (typeof value === 'number') {
    return this.validateNumberMin(name, value, length, alias);
  }

  // If value is array apply array validation.
  if (!!value && !!value.constructor && value.constructor === Array) {
    return this.validateArrayMin(name, value, length, alias);
  }
};

// Checks if string meets the min characters or not.
Validator.prototype.validateStringMin = function validateStringMin (name, value, length, alias) {
  alias = Validator.assertAlias(name, alias);

  var message = alias + " cannot be less than " + length + " characters.";
  if (value.length < length) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Checks if number meets the min characters or not.
Validator.prototype.validateNumberMin = function validateNumberMin (name, value, length, alias) {
  alias = Validator.assertAlias(name, alias);

  var message = alias + " value cannot be less than " + length;
  if (value < length) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Checks if array meets the min length criteria or not.
Validator.prototype.validateArrayMin = function validateArrayMin (name, value, length, alias) {
  alias = Validator.assertAlias(name, alias);

  var message = alias + " length cannot be less than " + length;
  if (value.length < length) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Check if the value meets the max criteria.
Validator.prototype.validateMax = function validateMax (name, value, length, alias) {

  // If value is undefined no need to validate.
  if (typeof value === 'undefined') {
    return;
  }

  // If value is string match the min characters criteria.
  if (typeof value === 'string') {
    return this.validateStringMax(name, value, length, alias);
  }

  // If value is number match the min value criteria.
  if (typeof value === 'number') {
    return this.validateNumberMax(name, value, length, alias);
  }

  // If value is array match the min length criteria
  if (!!value && !!value.constructor && value.constructor === Array) {
    return this.validateArrayMax(name, value, length, alias);
  }
};

// Check if the value matches the max characters criteria.
Validator.prototype.validateStringMax = function validateStringMax (name, value, length, alias) {
  alias = Validator.assertAlias(name, alias);

  var message = alias + " cannot be more than " + length + " characters.";
  if (value.length > length) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Checks if the value matches the max value criteria.
Validator.prototype.validateNumberMax = function validateNumberMax (name, value, length, alias) {
  alias = Validator.assertAlias(name, alias);

  var message = alias + " value cannot be greater than " + length;
  if (value > length) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Checks if the value matches the max length criteria.
Validator.prototype.validateArrayMax = function validateArrayMax (name, value, length, alias) {
  alias = Validator.assertAlias(name, alias);

  var message = alias + " length cannot be more than " + length;
  if (value.length > length) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Validate the value as a url.
Validator.prototype.validateUrl = function validateUrl (name, value, parameters, alias) {
    if ( parameters === void 0 ) parameters = null;


  alias = !!alias ? alias : name;

  var message = alias + " is not a valid url.";

  if (!validUrl.isUri(value)) {
    this.addValidationMessages(name, message);
  } else {
    this.removeValidationMessage(name, message);
  }
};

// Remove Validation message from error Bag
Validator.prototype.removeValidationMessage = function removeValidationMessage (name, message) {
  var errors = this.getErrors(name);
  var index = errors.indexOf(message);

  if (index > -1) {
    errors.splice(index, 1);
  }

  if (errors.length === 0) {
    delete this.errorMessagesBag[name];
  } else {
    this.errorMessagesBag[name] = errors;
  }
};

// Add Validation message to error Bag.
Validator.prototype.addValidationMessages = function addValidationMessages (name, message) {
  var errors = this.getErrors(name);

  if (!errors.includes(message)) {
    errors.push(message);
  }

  this.errorMessagesBag[name] = errors;
};

// Get Errors related to certain field.
Validator.prototype.getErrors = function getErrors (name) {
  var errors = [];

  if (this.errorMessagesBag[name]) {
    errors = this.errorMessagesBag[name];
  }

  return errors;
};

// Get first error related to certain field.
Validator.prototype.first = function first (name) {
  var errors = this.getErrors(name);

  if (errors.length > 0) {
    return Validator.ucfirst(errors[0]);
  }

  return null;

};

// Checks if the certain field has errors.
Validator.prototype.hasErrors = function hasErrors (name) {
  return this.getErrors(name).length > 0;
};

// Upper case the first character of the string.
Validator.ucfirst = function ucfirst (string) {
  return (string + '').charAt(0).toUpperCase() + (string + '').slice(1);
};

// Convert the rule string to Validate Method
Validator.toClassRule = function toClassRule (rule) {
  return ("validate" + (Validator.ucfirst(rule)));
};

// Check if Composite rule string contains parameters.
Validator.hasParameters = function hasParameters (rule) {
  return rule.split(':').length > 1
};

// Get parameters from the rule.
Validator.getParameters = function getParameters (rule) {

  var breakdown = rule.split(':');

  var rawParameters = breakdown[1].split(',');

  // If by chance parameters string is empty.
  if (rawParameters.length === 0) {
    throw new Error("No parameter specified.");
  }

  if (rawParameters.length === 1) {
    return rawParameters[0];
  }

  return rawParameters;
};

// Separate rule from parameters
Validator.separateRuleFromParameter = function separateRuleFromParameter (rule) {
  return rule.split(':')[0];
};

// Get field rules from the rules object
Validator.getRules = function getRules (name, rules) {

  // Checks if the rules exists
  if (!!rules[name]) {
    return rules[name];
  }

  return null;
};

Validator.assertAlias = function assertAlias (name, alias) {
  return !!alias ? alias : name;
};

return Validator;

})));
