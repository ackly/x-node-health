class CheckResult {
    constructor() {
        this.status = 'ok';
        this.errors = [];
        this.warnings = [];
        this.inf = {};
    }

    error(str) {
        this.status = 'error';
        this.errors.push(str);
    }

    warning(str) {
        if (this.status === 'ok') {
            this.status = 'warning';
        }

        this.warnings.push(str);
    }

    info(key, value = null) {
        if (!value && (typeof key === 'object')) {
            this.inf = {...this.inf, ...key};
        } else {
            this.inf[key.toString()] = value;
        }
    }

    get() {
        return {
            status: this.status,
            info: this.inf,
            errors: [].concat(
                this.errors.map(x => ({severity: 'error', message: x})),
                this.warnings.map(x => ({severity: 'warning', message: x}))
            )
        };
    }
}

module.exports = CheckResult;