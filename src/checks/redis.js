const util = require('util');

/**
 * Parses info string returned from redis
 *
 * @param {string} src
 *
 * @returns {{Server: {}, Memory: {}, Stats: {}}}
 */
const parseInfo = (src) => {
    const res = {};

    let curSectName = null;
    let curSect = {};

    for (let line of src.split('\n')) {
        line = line.trim();
        // section
        if (line.indexOf('#') === 0) {
            if (curSectName) {
                res[curSectName] = curSect;
                curSectName = null;
                curSect = {};
            }

            curSectName = line.split(' ')[1].trim();
        } else if (line.length) {
            const [key, value = ''] = line.split(':').map(x => x.trim());

            curSect[key] = value;
        }
    }

    return res;
};

module.exports = (opts = {}) => async () => {
    const result = {};

    const {connection: redis, thresholds = {}} = opts;
    const info = util.promisify(redis.info).bind(redis);

    try {
        const inf = parseInfo(await info());

        result.info = {
            version: inf.Server.redis_version,
            mode: inf.Server.redis_mode,
            uptime: inf.Server.uptime_in_seconds,
            connected_clients: inf.Clients.connected_clients,
            used_memory: inf.Memory.used_memory_human,
            total_memory: inf.Memory.total_system_memory_human,
            evictions: inf.Stats.evicted_keys
        };

        // todo: add thresholds check
    } catch (e) {
        result.errors = [e.message];
    }

    return result;
};