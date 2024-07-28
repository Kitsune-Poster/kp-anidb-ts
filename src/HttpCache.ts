import hash from 'hash-it';
import * as fs from 'fs';
import { AniDBRequester } from './AniDBRequester';
import { Cache } from './types/Cache';

type CacheResponse = {
    status: number,
    statusText: string,
    headers: Headers,
    body: string
}

/**
 * An abstract class that provides the base for all class which needs to cache HTTP responses.
 */
export abstract class HttpCache {
    constructor(
        private cache: Cache
    ){
        function removeSlash(path: string){
            return path.replace(/\/$/, "")
        }

        this.cache.path = removeSlash(this.cache.path)
    }

    private cacheResponse(url: string, response: CacheResponse){
        let cachePath = this.cache.path + "/" + hash(url)
        if(!fs.existsSync(this.cache.path)) fs.mkdirSync(this.cache.path)
        fs.writeFileSync(cachePath, JSON.stringify(response))
    }

    private getCachedResponse(url: string){
        let cachePath = this.cache.path + "/" + hash(url)
        if(fs.existsSync(cachePath)){
            return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CacheResponse
        }
        return null
    }

    protected async fetch(url: string | URL | globalThis.Request, init?: RequestInit){
        let stringUrl = ''
        switch(typeof url){
            case 'string':
                stringUrl = url
                break
            case 'object':
                if(url instanceof URL){
                    stringUrl = url.toString()
                }else if(url instanceof globalThis.Request){
                    stringUrl = url.url
                }
                break
        }

        const oldResponse = this.getCachedResponse(stringUrl)
        if(oldResponse){
            console.info(`Using cached response for ${stringUrl}`)
            return oldResponse
        }
        
        console.info(`Fetching ${stringUrl}`)
        const response = await fetch(url)
        const cacheResponse: CacheResponse = {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: await response.text()
        }
        this.cacheResponse(stringUrl, cacheResponse)
        return cacheResponse
    }
}