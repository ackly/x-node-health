class CheckResult {
    constructor() {
        this.status = 'ok';
        this.errors = [];
        this.warnings = [];
        this.inf = {};
    }

    static from(obj = {}) {
        const res = new CheckResult();

        res.errors = obj.errors || [];
        res.warnings = obj.warnings || [];
        res.inf = obj.info || {};

        if (obj.status) {
            if (['ok', 'warning', 'error'].indexOf(obj.status) === -1) {
                throw new Error('Service status MUST be one of [ok|warning|error]');
            }

            res.status = obj.status;
        } else {
            if (res.warnings.length && res.status === 'ok') {
                res.status = 'warning';
            }

            if (res.errors.length) {
                res.status = 'error';
            }
        }

        return res;
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