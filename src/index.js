/**
 * Copyright (c) 2017 Rummy Khan
 *
 * This module provides support for validation forms using react.
 * This works because any change in state will cause the render function to execute.
 */
class Validator {


    constructor() {
        this.errorMessagesBag = {};
    }

    // Core method of React Validator
    validate(values, rules, alias = {}, messages = []) {

        return new Promise((resolve, reject) => {

            // iterate over form values.
            for (let key in values) {

                if (!values.hasOwnProperty(key)) {
                    continue;
                }

                // get the value by key.
                let value = values[key];

                // get the rules corresponding to the form field.
                let rules = Validator.getRules(key, rules);

                // if rule is not present just skip the validation for that form field.
                if (!rules) {
                    return;
                }

                // validate each field on the given rules
                // Split the rules by pipe '|'
                this.validateSingleValue(key, value, rules.split('|'), alias[key]);
            }

            if (Object.keys(this.errorMessagesBag).length === 0) {
                resolve({success: true, data: values});
            } else {
                reject({success: false, data: values, errors: this.errorMessagesBag});
            }
        });
    }

    passes() {
        // It determines the validation is passed or failed by checking the error message bag.
        return Object.keys(this.errorMessagesBag).length === 0;
    }

    isValid() {
        // An Alias to method passes
        return this.passes();
    }

    getMessages() {
        // Get Error message bag.
        return this.errorMessagesBag;
    }

    // Validate A Single Form Value against the rules.
    validateSingleValue(name, value, rules, alias, messages = []) {

        // if rule is by chance an empty string
        if (!rules) {
            throw 'Rules are not present.';
        }

        // Iterate over rules to validate each rule one by one over a value.
        rules.forEach((rule) => {
            this.validateSingleRule(name, value, rule, alias);
        })
    }

    // Validate a single value over a single rule.
    validateSingleRule(name, value, rule, alias) {

        // get Rule Name to method.
        rule = Validator.toClassRule(rule);

        // Initialize the parameters to null..
        let parameters = null;

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
            throw `${rule} is not a Validator.`;
        }
    }

    // Require validate method.
    validateRequired(name, value, parameters = null, alias) {

        alias = Validator.assertAlias(name, alias);

        let message = `${alias} is required.`;

        // To fix !!0 issue.
        if (Number.isInteger(value)) {
            return;
        }

        // If value is empty, add validation message.
        if (!value) {
            this.addValidationMessages(name, message);
        } else {

            // If value is not empty remove validation message.
            this.removeValidationMessage(name, message)
        }
    }

    // Validate Valus is integer or not.
    validateInt(name, value, parameters = null, alias) {

        alias = Validator.assertAlias(name, alias);

        value = parseInt(value);

        let message = `${alias} should be a number.`;

        // Checks if number is integer.
        if (!Number.isInteger(value)) {
            // Add Validation messages.
            this.addValidationMessages(name, message);
        } else {
            // remove validation messages
            this.removeValidationMessage(name, message);
        }
    }

    // Validate email address.
    validateEmail(name, value, parameters = null, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `Please enter a valid email address.`;

        let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!pattern.test(value)) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Check if value is array or not.
    validateArray(name, value, parameters = null, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `${alias} is not a valid array.`;

        if (!value || !value.constructor || value.constructor !== Array) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Check if value is valid string.
    validateString(name, value, parameters = null, alias) {

        alias = Validator.assertAlias(name, alias);

        let message = `${alias} is not a valid string.`;
        if (typeof value !== 'string') {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Check if value is greater than the given value.
    validateGte(name, value, benchmark, alias) {
        alias = Validator.assertAlias(name, alias);

        value = parseInt(value);
        benchmark = parseInt(benchmark);

        if (isNaN(benchmark)) {
            throw `${benchmark} is not a valid integer.`;
        }

        let message = `${alias} must be greater than ${benchmark}.`;

        if (value < benchmark) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Checks if value is less than the given value.
    validateLte(name, value, benchmark, alias) {
        alias = Validator.assertAlias(name, alias);

        value = parseInt(value);
        benchmark = parseInt(benchmark);

        if (isNaN(benchmark)) {
            throw `${benchmark} is not a valid integer.`;
        }

        let message = `${alias} must be less than ${benchmark}.`;

        if (value > benchmark) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Checks if value satisfies the given rule by minimum
    validateMin(name, value, length, alias) {

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
    }

    // Checks if string meets the min characters or not.
    validateStringMin(name, value, length, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `${alias} cannot be less than ${length} characters.`;
        if (value.length < length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Checks if number meets the min characters or not.
    validateNumberMin(name, value, length, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `${alias} value cannot be less than ${length}`;
        if (value < length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Checks if array meets the min length criteria or not.
    validateArrayMin(name, value, length, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `${alias} length cannot be less than ${length}`;
        if (value.length < length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Check if the value meets the max criteria.
    validateMax(name, value, length, alias) {

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
    }

    // Check if the value matches the max characters criteria.
    validateStringMax(name, value, length, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `${alias} cannot be more than ${length} characters.`;
        if (value.length > length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Checks if the value matches the max value criteria.
    validateNumberMax(name, value, length, alias) {
        alias = Validator.assertAlias(name, alias);

        let message = `${alias} value cannot be greater than ${length}`;
        if (value > length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Checks if the value matches the max length criteria.
    validateArrayMax(name, value, length, alias) {
        alias = !!alias ? alias : name;

        let message = `${alias} length cannot be more than ${length}`;
        if (value.length > length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Validate the value as a url.
    validateUrl(name, value, parameters = null, alias) {

        alias = !!alias ? alias : name;

        let message = `${alias} is not a valid url.`;

        // https://stackoverflow.com/a/5717133
        let pattern = new RegExp('^(https?:\/\/)?' + // protocol
            '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|' + // domain name
            '((\d{1,3}\.){3}\d{1,3}))' + // OR ip (v4) address
            '(\:\d+)?(\/[-a-z\d%_.~+]*)*' + // port and path
            '(\?[;&a-z\d%_.~+=-]*)?' + // query string
            '(\#[-a-z\d_]*)?$', 'i'); // fragment locater

        if (!pattern.test(value)) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    // Remove Validation message from error Bag
    removeValidationMessage(name, message) {
        let errors = this.getErrors(name);
        let index = errors.indexOf(message);

        if (index > -1) {
            errors.splice(index, 1);
        }

        if (errors.length === 0) {
            delete this.errorMessagesBag[name];
        } else {
            this.errorMessagesBag[name] = errors;
        }
    }

    // Add Validation message to error Bag.
    addValidationMessages(name, message) {
        let errors = this.getErrors(name);

        if (!errors.includes(message)) {
            errors.push(message);
        }

        this.errorMessagesBag[name] = errors;
    }

    // Get Errors related to certain field.
    getErrors(name) {
        let errors = [];

        if (this.errorMessagesBag[name]) {
            errors = this.errorMessagesBag[name];
        }

        return errors;
    }

    // Get first error related to certain field.
    first(name) {
        let errors = this.getErrors(name);

        if (errors.length > 0) {
            return Validator.ucfirst(errors[0]);
        }

        return null;

    }

    // Checks if the certain field has errors.
    hasErrors(name) {
        return this.getErrors(name).length > 0;
    }

    // Upper case the first character of the string.
    static ucfirst(string) {
        return (string + '').charAt(0).toUpperCase() + (string + '').slice(1);
    }

    // Convert the rule string to Validate Method
    static toClassRule(rule) {
        return 'validate' + Validator.ucfirst(rule);
    }

    // Check if Composite rule string contains parameters.
    static hasParameters(rule) {
        return rule.split(':').length > 1
    }

    // Get parameters from the rule.
    static getParameters(rule) {

        let breakdown = rule.split(':');

        let rawParameters = breakdown[1].split(',');

        // If by chance parameters string is empty.
        if (rawParameters.length === 0) {
            throw "No parameter specified.";
        }

        if (rawParameters.length === 1) {
            return rawParameters[0];
        }

        return rawParameters;
    }

    // Separate rule from parameters
    static separateRuleFromParameter(rule) {
        return rule.split(':')[0];
    }

    // Get field rules from the rules object
    static getRules(name, rules) {

        // Checks if the rules exists
        if (!!rules[name]) {
            return rules[name];
        }

        return null;
    }

    static assertAlias(name, alias) {
        return !!alias ? alias : name;
    }

}

export default Validator;