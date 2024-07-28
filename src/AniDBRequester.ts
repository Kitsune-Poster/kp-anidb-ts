import { Download } from "./types/Download";
import { Cache } from "./types/Cache";
import { HttpCache } from "./HttpCache";
import * as fs from 'fs';

export type AniDBRequesterConfig = { client: string, clientver: number, protover: number, download: Download, cache: Cache, domain: string }

function getNowCachePath(cache: Cache){
    return cache.path + "/" + new Date().getFullYear() + "." + (new Date().getMonth() + 1) + "." + new Date().getDate() + "/"
}

/**
 * An abstract class that provides the base for all AniDB requesters.
 * It's basically a class that provides a constructor with every required configuration to interact with the AniDB API.
 */
export abstract class AniDBRequester extends HttpCache {
    constructor(
        protected config: AniDBRequesterConfig
    ){
        super({
            path: getNowCachePath(config.cache)
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
}