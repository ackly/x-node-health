const assert = require('assert');

/**
 * Get database version.
 *
 * @param sequelize
 *
 * @returns {Promise<string|null>}
 */
const getVersion = async (sequelize) => {
    switch (sequelize.getDialect()) {
        case 'postgres': {
            const res = await sequelize.query('select version() as version', {type: 'SELECT'});

            return (res[0]||{}).version;
        }
        case 'mysql': {
            const res = await sequelize.query('show variables like "version"', {type: 'SELECT'});
            let version = null;

            if (res.length) {
                version = (res.find(row => row.Variable_name === 'version') || {}).Value;
            }

            return version;
        }
        default: {
            return null;
        }
    }
};


/**
 *
 * @param opts
 *
 * @returns {function(*)}
 */
module.exports = (opts = {}) => async () => {
    const result = {};

    const {connection: sequelize} = opts;

    try {
        const res = await sequelize.query('select 1 as test', {type: 'SELECT'});

        if (!res.length || !(res[0] || {}).test) {
            throw new Error('Test query failed (select 1);');
        }

        assert(res[0].test === 1, 'Test query returned incorrect value');

        result.info = {'version': await getVersion(sequelize)};
    } catch (e) {
        result.errors = [e.message];
    }

    return result;
};