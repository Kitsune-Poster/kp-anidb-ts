import { Download } from "./types/Download";
import { Cache } from "./types/Cache";
import { HttpCache } from "./HttpCache";
import * as fs from 'fs';
import { Mixin } from 'ts-mixer';
import { HttpRateLimit } from "./HttpRateLimit";
import { CacheResponse } from "./types/CacheResponse";

export type AniDBRequesterConfig = { client: string, clientver: number, protover: number, download: Download, cache: Cache, domain: string }

function getNowCachePath(cache: Cache){
    return cache.path + "/" + new Date().getFullYear() + "." + (new Date().getMonth() + 1) + "." + new Date().getDate() + "/"
}

/**
 * An abstract class that provides the base for all AniDB requesters.
 * It's basically a class that provides a constructor with every required configuration to interact with the AniDB API.
 * 
 * It provides a base for caching and rate limiting requests.
 */
export abstract class AniDBRequester extends Mixin(HttpCache, HttpRateLimit) {
    constructor(
        protected config: AniDBRequesterConfig
    ){
        super({
            path: getNowCachePath(config.cache),
            rateLimit: config.cache.rateLimit
        })

        function removeSlash(path: string){
            return path.replace(/\/$/, "")
        }

        this.config.download.path = removeSlash(this.config.download.path)
        this.config.cache.path = removeSlash(this.config.cache.path)
        this.config.domain = removeSlash(this.config.domain)
    }

    protected getBaseUrl = () => { return `${this.config.domain}/httpapi?client=${this.config.client}&clientver=${this.config.clientver}&protover=${this.config.protover}` }

    protected getNowCachePath = () => { return getNowCachePath(this.config.cache) }

    protected isNowCachePathExists = () => { return fs.existsSync(this.getNowCachePath()) }

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
        
        this.verifyRateLimit()

        this.registerRequest()
        
        console.info(`Fetching ${stringUrl}`)
        const response = await fetch(url, init)
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