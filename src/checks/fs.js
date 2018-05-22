const fs = require('fs');
const exec = require('child_process').exec;
const {promisify} = require('util');

const access = promisify(fs.access);

const checkDrive = (drive) => new Promise((resolve, reject) => {
    exec("df -k '" + drive.replace(/'/g,"'\\''") + "'", function(error, stdout) {
        const result = {};

        if (error) {
            reject(error);
        } else {
            const lines = stdout.trim().split("\n");

            const str_disk_info = lines[lines.length - 1].replace(/[\s\n\r]+/g, ' ');
            const disk_info = str_disk_info.split(' ');

            result.total = disk_info[1] * 1024;
            result.used = disk_info[2] * 1024;
            result.free = disk_info[3] * 1024;

            resolve(result);
        }
    });
});

const makeHumanReadable = (value) => {
    const suffixes = ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb'];

    const p = Math.min(Math.floor((Math.log(value) / Math.log(1024))), suffixes.length);

    return (value / Math.pow(1024, p)).toFixed(2) + suffixes[p];
};

module.exports = (opts = {}) => async () => {
    const {path, need_write = true, thresholds = {}} = opts;

    const result = {
        errors: [],
        info: {},
        warnings: []
    };

    const checkMode = fs.constants.F_OK | (need_write ? (fs.constants.R_OK | fs.constants.W_OK) : fs.constants.R_OK);

    try {
        await access(path, checkMode);
    } catch (e) {
        if (e.code === 'ENOENT') {
            result.errors.push('Specified path does not exists');
            return result;
        } else {
            result.errors.push('Specified path is not' + (need_write ? 'writable' : 'readable'));
        }
    }

    try {
        const space = await checkDrive(path);

        const usedPercent = (space.used / space.total * 100);

        result.info['free space'] = makeHumanReadable(space.free);
        result.info.usage = usedPercent.toFixed(1) + '%';

        if (thresholds.free_bytes > 0 && space.free < thresholds.free_bytes) {
            result.warnings.append(`Amount of free disk space is less that required value (${thresholds.free_bytes})`);
        }

        if (thresholds.usage_percent > 0 && usedPercent > thresholds.usage_percent) {
            result.warnings.append(`Disk usage overpasses required threshold (${thresholds.usage_percent})`);
        }
    } catch (e) {
        result.errors.push(e.message);
    }

    return result;
};