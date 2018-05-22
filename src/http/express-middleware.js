const {fillDefaults} = require('./param');
const checks = require('../checks');

module.exports = (options = {}) => {
    const opts = fillDefaults(options);

    return (req, res, next) => {
        if (req.path === opts.path) {
            checks.handle(opts).then(result => {
                if (result.status === 'error') {
                    res.status(500);
                }

                res.json(result);
            }).catch(err => {
                res.status(500).json(err);
            });

            return;
        }

        next();
    };
};