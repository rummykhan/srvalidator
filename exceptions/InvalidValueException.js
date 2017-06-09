class InvalidValueException {
    constructor(message) {
        this.name = 'InvalidValueException';
        this.message = message;
    }

    getMessage() {
        return this.message;
    }
}

export default InvalidValueException;