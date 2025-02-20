import fs from 'fs';
import crypto from 'crypto';
import querystring from 'querystring';

function calculateMD5(data) {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
}

function create_tag(r) {
    var cacheKey = r.headersOut['CACHE_KEY'];
    r.error(`cacheKey: ${cacheKey}`);
    r.error(`args: ${querystring.stringify(r.args)}`);
    r.error(`headersIn: ${JSON.stringify(r.headersIn)}`);

    if (cacheKey) {
        // Calculate the MD5 of the cache_key of nginx
        // const nginxCacheKey = `${r.headersIn['Host']}${r.uri}${querystring.stringify(r.args)}`;
        // const md5 = calculateMD5(nginxCacheKey);
        r.error(`writing file: /var/cache/tags/${cacheKey} with uri: ${r.uri}`);
        fs.writeFile(`/var/cache/tags/${cacheKey}`, r.uri, (err) => {
            if (err) {
                r.log(`Error writing file: ${err}`);
            }
        });
    }
}

function flush_tag(r) {
    // Remove /purge from uri
    const cacheTag = r.uri.replace(/\/purge/, '');
    // get the uri from the cache tag written by create_tag
    fs.readFile(`/var/cache/tags/${cacheTag}`, 'utf8', (err, data) => {
        if (err) {
            r.error(`Error reading file: ${err}`);
            r.return(500);
        }
        r.error(`Flushing cache tag: ${cacheTag} with uri: ${data}`);
        r.subrequest(data);
        r.return(200);
    });

    r.return(404)
}

export default {create_tag, flush_tag};