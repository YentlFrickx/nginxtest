import fs from 'fs';
import crypto from 'crypto';

function calculateMD5(data) {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
}

function create_tag(r) {
    const tag = r.headersOut['tag'];

    if (tag) {

        const cacheKey = calculateMD5(tag);
        r.log(`writing file: /var/cache/tags/${cacheKey} with uri: ${r.uri}`);
        // append the uri to the cache tag file if it is not already there
        fs.readFile(`/var/cache/tags/${cacheKey}`, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                r.error(`Error reading file: ${err}`);
            }

            if (!data || !data.includes(r.uri)) {
                fs.appendFile(`/var/cache/tags/${cacheKey}`, `${r.uri}\n`, (err) => {
                    if (err) {
                        r.error(`Error writing file: ${err}`);
                    }
                });
            }
        });
    }
}

function flush_tag(r) {
    const tag = r.headersIn['tag'];
    const cacheKey = calculateMD5(tag);

    // get the uri from the cache tag written by create_tag
    fs.readFile(`/var/cache/tags/${cacheKey}`, 'utf8', (err, data) => {
        if (err) {
            r.error(`Error reading file: ${err}`);
            r.return(500);
        }

        // for each line in data, send a subrequest to the uri
        data.split('\n').forEach(function (line) {
            if (line) {
                r.log(`Flushing cache tag: ${cacheKey} with uri: ${line}`);
                r.subrequest(line);
            }
        });

        r.return(200);
    });

    r.return(404)
}

export default {create_tag, flush_tag};