const util = require('util');

module.exports = (opts = {}) => async () => {
    const result = {
        warnings: [],
        errors: []
    };

    const {connection: client} = opts;
    const health = util.promisify(client.cluster.health).bind(client);

    try {
        const res = await health({pretty: true});

        if (res.status === 'yellow') {
            result.warnings = ['[YELLOW]: Elasticsearch has allocated all of the primary shards, ' +
                'but some/all of the replicas have not been allocated.'];
        }

        if (res.status === 'red') {
            result.errors.push('[RED]: Some or all of (primary) shards are not ready.');
        }

        result.info = {
            nodes: res.number_of_nodes,
            data_nodes: res.number_of_data_nodes,
            active_primary_shards: res.active_primary_shards,
            active_shards: res.active_shards,
            unassigned_shards: res.unassigned_shards
        };
    } catch (e) {
        result.errors.push(e.message);
    }

    return result;
};