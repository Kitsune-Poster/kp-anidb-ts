import * as fs from 'fs';
import { Mixin } from 'ts-mixer';
import xml2js from 'xml2js';
import { AnimeDetailOriginalJson } from "./types/AnimeDetailOriginalJson";
import { AnimeHotOriginalJson } from "./types/AnimeHotOriginalJson";
import { AnimeMainOriginalJson } from "./types/AnimeMainOriginalJson";
import { AnimeRandomSimilarOriginalJson } from "./types/AnimeRandomSimilarOriginalJson";
import { AnimeFetchRecommendationOriginalJson } from "./types/AnimeFetchRecommendationOriginalJson";
import { HttpUtils } from "@nathangasc/http-utils-ts";
import { HttpConfig } from "@nathangasc/http-utils-ts/dist/types/HttpConfig";
import { Download } from './types/Download';

export type AniDBRequesterConfig = { client: string, clientver: number, protover: number, download: Download, httpConfig: HttpConfig, domain: string }

function getNowCachePath(config: HttpConfig){
    return config.cache.path + "/" + new Date().getFullYear() + "." + (new Date().getMonth() + 1) + "." + new Date().getDate() + "/"
}

/**
 * An abstract class that provides the base for all AniDB requesters.
 * It's basically a class that provides a constructor with every required configuration to interact with the AniDB API.
 * 
 * It provides a base for caching and rate limiting requests.
 */
export abstract class AniDBRequester extends HttpUtils {
    constructor(
        protected aniDBRequesterConfig: AniDBRequesterConfig
    ){
        super(aniDBRequesterConfig.httpConfig)

        function removeSlash(path: string){
            return path.replace(/\/$/, "")
        }

        this.aniDBRequesterConfig.download.path = removeSlash(this.aniDBRequesterConfig.download.path)
        this.aniDBRequesterConfig.httpConfig.cache.path = removeSlash(this.aniDBRequesterConfig.httpConfig.cache.path)
        this.aniDBRequesterConfig.domain = removeSlash(this.aniDBRequesterConfig.domain)

    }

    protected getBaseUrl = () => { return `${this.aniDBRequesterConfig.domain}/httpapi?client=${this.aniDBRequesterConfig.client}&clientver=${this.aniDBRequesterConfig.clientver}&protover=${this.aniDBRequesterConfig.protover}` }

    protected getNowCachePath = () => { return getNowCachePath(this.aniDBRequesterConfig.httpConfig) }

    protected isNowCachePathExists = () => { return fs.existsSync(this.getNowCachePath()) }

    async fetchWrap<T>(path: string, noCache: boolean = false): Promise<T>{
        let url = `${this.getBaseUrl()}${path}`
        let response = await this.fetch(url, undefined, noCache)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json
    }

    /**
     * Allows retrieval of non-file or episode related information for a specific anime by AID (AniDB anime id).
     * @returns 
     */
    protected async fetchAnimeDetails(aid: number): Promise<AnimeDetailOriginalJson>{
        let path = `&request=anime&aid=${aid}`
        return await this.fetchWrap(path, false)
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Please note, however, that the 'random recommendations' are, in fact, random. Please do not expect random 
     * results here to match random results there.
     * @returns 
     */
    protected async fetchRecommendation(): Promise<AnimeFetchRecommendationOriginalJson>{
        let path = "&request=randomrecommendation"
        return await this.fetchWrap(path, false)
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Please note, however, that the 'random similar' are, in fact, random. Please do not expect random results 
     * here to match random results there.
     * @returns 
     */
    protected async fetchRandomSimilar(): Promise<AnimeRandomSimilarOriginalJson>{
        let path = "&request=randomsimilar"
        return await this.fetchWrap(path, false)
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Unlike the two random result commands, the results here will match the results as supplied by the main web 
     * page (with some possible variance of a few hours, depending on cache life.)
     * @returns 
     */
    protected async fetchHotAnime(): Promise<AnimeHotOriginalJson>{
        let path = "&request=hotanime"
        return await this.fetchWrap(path, false)
    }

    /**
     * A one-stop command returning the combined results of random recommendation, random similar, and hot anime. 
     * Use this command instead of scraping the HTML, and if you need more than one of the individual replies.
     * @returns 
     */
    protected async fetchMain(): Promise<AnimeMainOriginalJson>{
        let path = "&request=main"
        return await this.fetchWrap(path, false)
    }
}