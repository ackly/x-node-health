const checks = {
    fs: require('./fs'),
    redis: require('./redis'),
    sequelize: require('./sequelize'),
    elasticsearch: require('./elasticsearch')
};

const CheckResult = require('../check-result');

const register = (type, callable) => {
    checks[type] = callable;
};

const handle = async (options) => {
    const res = {
        name: options.name || '',
        status: 'ok',
        components: {},
        dependencies: options.dependencies || []
    };

    for (let checkName in options.checks) {
        let check = options.checks[checkName];

        if (typeof check === 'object') {
            if (!checks[check.type]) {
                throw new Error(`Check for type ${check.type} not implemented`);
            }

            check = checks[check.type](check);
        }

        const checkResult = CheckResult.from(await check());

        if (checkResult.status === 'warning' && res.status === 'ok') {
            res.status = 'warning';
        }

        if (checkResult.status === 'error') {
            res.status = 'error';
        }

        res.components[checkName] = checkResult.get();
    }

    return res;
};

module.exports = {
    ...checks,
    handle,
    register
};