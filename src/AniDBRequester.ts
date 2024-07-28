import { Download } from "./types/Download";
import { Cache } from "./types/Cache";
import { HttpCache } from "./HttpCache";
import * as fs from 'fs';
import { Mixin } from 'ts-mixer';
import { HttpRateLimit } from "./HttpRateLimit";
import { CacheResponse } from "./types/CacheResponse";
import xml2js from 'xml2js';
import { AnimeDetailOriginalJson } from "./types/AnimeDetailOriginalJson";

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

    protected async fetch(url: string | URL | globalThis.Request, init?: RequestInit, noCache: boolean = false): Promise<CacheResponse>{
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
        if(oldResponse && !noCache){
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

        if(!noCache)
            this.cacheResponse(stringUrl, cacheResponse)
        
        return cacheResponse
    }

    /**
     * Allows retrieval of non-file or episode related information for a specific anime by AID (AniDB anime id).
     * @returns 
     */
    protected async fetchAnimeDetails(aid: number): Promise<AnimeDetailOriginalJson>{
        let url = `${this.getBaseUrl()}&request=anime&aid=${aid}`
        let response = await this.fetch(url, undefined, false)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json as AnimeDetailOriginalJson
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Please note, however, that the 'random recommendations' are, in fact, random. Please do not expect random 
     * results here to match random results there.
     * @returns 
     * 
     * //TODO: Add a type for this return
     */
    protected async fetchRecommendation(): Promise<any>{
        let url = `${this.getBaseUrl()}&request=randomrecommendation`
        let response = await this.fetch(url, undefined, true)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Please note, however, that the 'random similar' are, in fact, random. Please do not expect random results 
     * here to match random results there.
     * @returns 
     * 
     * //TODO: Add a type for this return
     */
    protected async fetchRandomSimilar(): Promise<any>{
        let url = `${this.getBaseUrl()}&request=randomsimilar`
        let response = await this.fetch(url, undefined, true)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Unlike the two random result commands, the results here will match the results as supplied by the main web 
     * page (with some possible variance of a few hours, depending on cache life.)
     * @returns 
     * 
     * //TODO: Add a type for this return
     */
    protected async fetchHotAnime(): Promise<any>{
        let url = `${this.getBaseUrl()}&request=hotanime`
        let response = await this.fetch(url, undefined, true)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json
    }

    /**
     * A one-stop command returning the combined results of random recommendation, random similar, and hot anime. 
     * Use this command instead of scraping the HTML, and if you need more than one of the individual replies.
     * @returns 
     * 
     * //TODO: Add a type for this return
     */
    protected async fetchMain(): Promise<any>{
        let url = `${this.getBaseUrl()}&request=main`
        let response = await this.fetch(url, undefined, true)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json
    }
}