import { Cache } from "./types/Cache";
import * as fs from 'fs'

type RateLimit = {
    [key: string]: number
}

export class HttpRateLimitError extends Error{
    constructor(){
        super("Rate limit reached")
    }
}

export abstract class HttpRateLimit{
    constructor(
        protected cache: Cache,
    ){}

    private createCacheFile(){
        if(!fs.existsSync(this.cache.path)) fs.mkdirSync(this.cache.path)

        let cacheFile = this.cache.path + "/rate-limit.json"
        if(!fs.existsSync(cacheFile)){
            fs.writeFileSync(cacheFile, JSON.stringify({ }))
        }

        return cacheFile
    }

    private getCache(){
        let cacheFile = this.createCacheFile()
        return JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as RateLimit
    }

    private setCache(cache: any){
        let cacheFile = this.createCacheFile()
        fs.writeFileSync(cacheFile, JSON.stringify(cache))
    }

    protected registerRequest(){
        let cache = this.getCache()
        let now = Date.now()
        cache[now] = (cache[now] || 0) + 1
        this.setCache(cache)
    }

    private isRateLimitReached(){
        let cache = this.getCache()
        let now = Date.now()
        let count = 0
        for(let key in cache){
            if(parseInt(key) + this.cache.rateLimit.perMiliseconds > now){
                count += cache[key]
            }
        }

        return count+1 > this.cache.rateLimit.maxRequest
    }

    protected verifyRateLimit(): void {
        if(this.isRateLimitReached()){
            throw new HttpRateLimitError()
        }
    }
}