import hash from 'hash-it';
import * as fs from 'fs';
import { AniDBRequester } from './AniDBRequester';
import { Cache } from './types/Cache';
import { CacheResponse } from './types/CacheResponse';

/**
 * An abstract class that provides the base for all class which needs to cache HTTP responses.
 */
export abstract class HttpCache {
    constructor(
        protected cache: Cache
    ){
        function removeSlash(path: string){
            return path.replace(/\/$/, "")
        }

        this.cache.path = removeSlash(this.cache.path)
    }

    protected cacheResponse(url: string, response: CacheResponse){
        let cachePath = this.cache.path + "/" + hash(url)
        if(!fs.existsSync(this.cache.path)) fs.mkdirSync(this.cache.path)
        fs.writeFileSync(cachePath, JSON.stringify(response))
    }

    protected getCachedResponse(url: string){
        let cachePath = this.cache.path + "/" + hash(url)
        if(fs.existsSync(cachePath)){
            return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CacheResponse
        }
        return null
    }
}