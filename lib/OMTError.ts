class OMTError extends Error {

    constructor(...args) {
        super(...args);
        this.name = 'Object Model Transform Error'
    }
}

export default OMTError;