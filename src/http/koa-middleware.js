const {fillDefaults} = require('./param');
const checks = require('../checks');

module.exports = (options = {}) => {
    const opts = fillDefaults(options);

    return async (ctx, next) => {
        if (ctx.request.path === opts.path) {
            const res = await checks.handle(options);

            if (res.status === 'error') {
                ctx.response.statusCode = 500;
            }

            ctx.body = res;

            return;
        }

        return await next();
    };
};