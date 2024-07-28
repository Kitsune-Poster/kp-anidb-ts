import { KSAniDB } from "../KSAniDB"
import { KSAniDBBuilderClientVer } from "./KSAniDBBuilderClientVer"
import { Download } from "../types/Download"
import { Cache } from "../types/Cache"

/**
 * A class that builds a KSAniDB object with optional parameters
 * All values have default values, so it's not required to set them all but
 * we still can set them if we want to.
 */
export class KSAniDBBuilderOptional{
    constructor(private builder: KSAniDBBuilderClientVer){}

    private protover: number = 1
    private download: Download = {
        url: new URL('http://anidb.net/api/anime-titles.xml.gz'),
        path: "./cache"
    }
    private cache: Cache = {
        path: "./cache",
        rateLimit: {
            maxRequest: 1,
            perMiliseconds: 2000
        }
    }

    private domain: string = `http://api.anidb.net:9001`

    /**
     * Set the domain where the requests will be made
     * @param url is the domain
     * @returns 
     */
    setDomain(url: string){
        this.domain = url
        return this
    }

    /**
     * Set the protocol version to be used in the requests
     * @param protover is the protocol version
     * @returns 
     */
    setProtoVer(protover: number){
        this.protover = protover
        return this
    }

    /**
     * Set the url where the "anime-titles.xml.gz" file will be downloaded.
     * This file contain all the anime titles in the AniDB database. They are required to
     * search for details about an anime later on.
     * @param url is the URL where the file will be downloaded
     * @returns
     */
    setDownloadUrl(url: URL){
        this.download.url = url
        return this
    }

    /**
     * Set the path where the downloaded files will be stored
     * @param path is the path where the files will be stored 
     * @returns 
     */
    setDownloadPath(path: string){
        this.download.path = path
        return this
    }

    /**
     * Set the path where the cache will be stored
     * @param path 
     * @returns 
     */
    setCachePath(path: string){
        this.cache.path = path
        return this
    }

    /**
     * Set the rate limit for the requests to maxRequest each perMiliseconds (for example, 1 request each 2 seconds)
     * @param maxRequest is the maximum number of requests that can be made in the given time
     * @param perMiliseconds is the time in miliseconds that the maxRequest can be made
     */
    setRateLimit(maxRequest: number, perMiliseconds: number){
        this.cache.rateLimit = {
            maxRequest,
            perMiliseconds
        }
        return this
    }

    build(){
        const KSAniDBBuilderClientVer = (this as any).builder as any
        const KSAniDBBuilderClient = KSAniDBBuilderClientVer.builder as any
        return new KSAniDB({
            client: KSAniDBBuilderClient.client,
            clientver: KSAniDBBuilderClientVer.clientver,
            protover: this.protover,
            download: this.download,
            cache: this.cache,
            domain: this.domain
        })
    }
}