const BackendConfig = require("../../configs/backendConfig");

class Empty {

    static IDENTIFIER = BackendConfig.FIELDS.EMPTY.IDENTIFIER;

    constructor() {
    }

}

module.exports = Empty;