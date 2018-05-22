const defaultParams = {
    name: '',
    path: '/health',
    checks: {},
    dependencies: []
};

/**
 * Merge user supplied options with defaults
 *
 * @param {object} src
 *
 * @returns {{name: string, path: string, checks: {}, dependencies: Array}}
 */
const fillDefaults = src => ({...defaultParams, ...src});

module.exports = {
    fillDefaults
};