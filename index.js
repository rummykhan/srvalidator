class Validator {

    constructor() {
        this.errorMessagesBag = {};
    }

    validate(values, rules, alias = {}, messages = []) {

        for (let key in values) {

            let value = values[key];

            let rule = this.getRules(key, rules);

            if (!rule) {
                return;
            }

            this.validateSingleValue(key, value, rule.split('|'), alias[key]);
        }

        return this.passes();
    }

    passes() {
        return Object.keys(this.errorMessagesBag).length === 0;
    }

    isValid() {
        return Object.keys(this.errorMessagesBag).length === 0;
    }

    getMessages() {
        return this.errorMessagesBag;
    }

    getRules(name, rules) {
        if (rules[name]) {
            return rules[name];
        }

        return null;
    }

    validateSingleValue(name, value, rules, alias, messages = []) {
        if (!rules) {
            throw 'Rules are not present.';
        }

        rules.forEach((rule) => {
            this.validateSingleRule(name, value, rule, alias);
        })
    }

    validateSingleRule(name, value, rule, alias) {
        rule = Validator.toClassRule(rule);
        let parameters = null;

        if (Validator.hasParameters(rule)) {
            parameters = Validator.getParameters(rule);
            rule = Validator.separateRuleFromParameter(rule);
        }

        try {
            this[rule](name, value, parameters, alias);
        } catch (e) {
            throw `${rule} is not a Validator.`;
        }
    }

    static toClassRule(rule) {
        return 'validate' + Validator.ucfirst(rule);
    }

    static hasParameters(rule) {
        return rule.split(':').length > 1
    }

    static getParameters(rule) {

        let breakdown = rule.split(':');

        let rawParameters = breakdown[1].split(',');

        if (rawParameters.length === 0) {
            throw "No parameter specified.";
        }

        if (rawParameters.length === 1) {
            return rawParameters[0];
        }

        return rawParameters;
    }

    static separateRuleFromParameter(rule) {
        return rule.split(':')[0];
    }

    validateRequired(name, value, parameters = null, alias) {

        alias = !!alias ? alias : name;

        let message = `${alias} is required.`;

        // To fix !!0 issue.
        if (Number.isInteger(value)) {
            return;
        }

        if (!value) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message)
        }
    }

    validateInt(name, value, parameters = null, alias) {
        alias = !!alias ? alias : name;
        value = parseInt(value);

        let message = `${alias} should be a number.`;

        if (!Number.isInteger(value)) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateEmail(name, value, parameters = null, alias) {
        alias = !!alias ? alias : name;

        let message = `Please enter a valid email address.`;

        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!re.test(value)) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateArray(name, value, parameters = null, alias) {
        alias = !!alias ? alias : name;
        let message = `${alias} is not a valid array.`;
        if (!value || !value.constructor || value.constructor !== Array) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateString(name, value, parameters = null, alias) {

        alias = !!alias ? alias : name;

        let message = `${alias} is not a valid string.`;
        if (typeof value !== 'string') {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateGte(name, value, benchmark, alias) {
        alias = !!alias ? alias : name;

        value = parseInt(value);
        benchmark = parseInt(benchmark);

        let message = `${alias} must be greater than ${benchmark}.`;

        if (value < benchmark) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateLte(name, value, benchmark, alias) {
        alias = !!alias ? alias : name;

        value = parseInt(value);
        benchmark = parseInt(benchmark);

        let message = `${alias} must be less than ${benchmark}.`;

        if (value > benchmark) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateMin(name, value, length, alias) {

        if (typeof value === 'undefined') {
            return;
        }

        if (typeof value === 'string') {
            return this.validateStringMin(name, value, length, alias);
        }

        if (typeof value === 'number') {
            return this.validateNumberMin(name, value, length, alias);
        }

        if (!!value && !!value.constructor && value.constructor === Array) {
            return this.validateArrayMin(name, value, length, alias);
        }
    }

    validateStringMin(name, value, length, alias) {
        alias = !!alias ? alias : name;

        let message = `${alias} cannot be less than ${length} characters.`;
        if (value.length < length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateNumberMin(name, value, length, alias) {
        alias = !!alias ? alias : name;
        let message = `${alias} value cannot be less than ${length}`;
        if (value < length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateArrayMin(name, value, length, alias) {
        alias = !!alias ? alias : name;
        let message = `${alias} length cannot be less than ${length}`;
        if (value.length < length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }


    validateMax(name, value, length, alias) {
        if (typeof value === 'undefined') {
            return;
        }

        if (typeof value === 'string') {
            return this.validateStringMax(name, value, length, alias);
        }

        if (typeof value === 'number') {
            return this.validateNumberMax(name, value, length, alias);
        }

        if (!!value && !!value.constructor && value.constructor === Array) {
            return this.validateArrayMax(name, value, length, alias);
        }
    }

    validateStringMax(name, value, length, alias) {
        alias = !!alias ? alias : name;
        let message = `${alias} cannot be more than ${length} characters.`;
        if (value.length > length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateNumberMax(name, value, length, alias) {
        alias = !!alias ? alias : name;
        let message = `${alias} value cannot be greater than ${length}`;
        if (value > length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

    validateArrayMax(name, value, length, alias) {
        alias = !!alias ? alias : name;

        let message = `${alias} length cannot be more than ${length}`;
        if (value.length > length) {
            this.addValidationMessages(name, message);
        } else {
            this.removeValidationMessage(name, message);
        }
    }

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

    addValidationMessages(name, message) {
        let errors = this.getErrors(name);

        if (!errors.includes(message)) {
            errors.push(message);
        }

        this.errorMessagesBag[name] = errors;
    }

    getErrors(name) {
        let errors = [];

        if (this.errorMessagesBag[name]) {
            errors = this.errorMessagesBag[name];
        }

        return errors;
    }

    first(name) {
        let errors = this.getErrors(name);

        if (errors.length > 0) {
            return Validator.ucfirst(errors[0]);
        }

        return null;

    }

    hasErrors(name) {
        return this.getErrors(name).length > 0;
    }

    static ucfirst(string) {
        return (string + '').charAt(0).toUpperCase() + (string + '').slice(1);
    }

}

export default new Validator();