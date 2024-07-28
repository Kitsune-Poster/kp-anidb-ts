import * as fs from 'fs'
import * as xml2js from 'xml2js'
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import zlib = require("node:zlib");
import MiniSearch, { SearchResult, Suggestion } from 'minisearch'
import hash from 'hash-it';
import { KSAniDBBuilderClient } from './builder/KSAniDBBuilderClient';
import { AnimeTitleOriginalJson } from './types/AnimeTitleOriginalJson';
import { AnimeTitleTransformedJson } from './types/AnimeTitleTransformedJson';
import { AnimeTitle } from './AnimeTitle';
import { AniDBRequester } from './AniDBRequester';

const streamPipeline = promisify(pipeline);

/**
 * A client to interact with the AniDB API
 * 
 * usage:
 * ```typescript
 * const client = KSAniDB.builder()
 *    .setClient("myclient")
 *    .setClientVer(1)
 *    .build()
 *  
 * await client.init()
 * 
 * const titles = client.getTitles("Utawarerumono", "fr")
 * console.log(titles)
 * ```
 */
export class KSAniDB extends AniDBRequester {
    /**
     * A builder utility to create a new KSAniDB instance
     * @returns A new KSAniDBBuilderClient instance to build a new KSAniDB instance
     */
    static builder(){
        return new KSAniDBBuilderClient()
    }

    private isInitialized = false
    private inMemoryJson: AnimeTitleTransformedJson = []
    private miniSearch = new MiniSearch({
        fields: ['title'],
        storeFields: ['title', 'aid', 'lang', 'type'],
        idField: 'hash',
    })

    async init(){
        if(!this.isInitialized){
            const jsonPath = await this.downloadAid()
            const original = JSON.parse(fs.readFileSync(jsonPath).toString())
            const transformed = this.jsonOriginalToTransformed(original)
            this.inMemoryJson = transformed
            this.miniSearch.addAll(this.inMemoryJson)

            this.isInitialized = true
        }else{
            throw new Error("Already initialized")
        }
    }

    private jsonOriginalToTransformed(json: AnimeTitleOriginalJson): AnimeTitleTransformedJson{
        let transformed: AnimeTitleTransformedJson = []

        for(let anime of json.animetitles.anime){
            let aid = parseInt(anime.$.aid)
            for(let title of anime.title){
                let id = hash({aid: aid, title: title._, type: title.$.type, lang: title.$["xml:lang"]})
                transformed.push(new AnimeTitle(
                    this.config,
                    id,
                    aid,
                    title._,
                    title.$.type,
                    title.$["xml:lang"]
                ))
            }
        }

        return transformed
    }

    private checkInit(){
        if(!this.isInitialized){
            throw new Error("Not initialized")
        }
    }

    private assureAidPresence(){
        if(!fs.existsSync(this.getNowCachePath() + "anime-titles.json")){
            this.isInitialized = false
            this.inMemoryJson = []
            this.miniSearch.removeAll()
            this.init()
        }
    }

    private checkAll(){
        this.checkInit()
        this.assureAidPresence()
    }

    /**
     * Downloads the anime-titles.xml.gz file from the AniDB API.
     * If the file isn't downloaded, it will:
     * 1. Download the .gz file (if it doesn't exist)
     * 2. Extract the .gz file (if it doesn't exist)
     * 3. Convert the .xml file to .json (if it doesn't exist)
     * 
     * @returns The path to the anime-titles.json file
     */
    private async downloadAid(): Promise<string>{
        let filename = "anime-titles"
        let filenamexml = filename + ".xml"
        let filenamegz = filenamexml + ".gz"
        let filenamejson = filename + ".json"

        if(!fs.existsSync(this.config.download.path)) fs.mkdirSync(this.config.download.path)
        if(!fs.existsSync(this.getNowCachePath())) fs.mkdirSync(this.getNowCachePath())

        //if gz file does not exist, download it
        if(!fs.existsSync(this.getNowCachePath() + filenamegz)){
            const response = await fetch(this.config.download.url)
            if(!response.ok) throw new Error(`unexpected response ${response.statusText}`)
            const body = response.body
            if(!body) throw new Error("No body")

            const writer = fs.createWriteStream(this.getNowCachePath() + filenamegz)

            await streamPipeline(response.body, writer);
        }

        //if xml file does not exist, extract gz file 
        if(!fs.existsSync(this.getNowCachePath() + filenamexml)){
            const unzip = zlib.createUnzip();
            const reader = fs.createReadStream(this.getNowCachePath() + filenamegz);
            const writer = fs.createWriteStream(this.getNowCachePath() + filenamexml);
            await streamPipeline(reader.pipe(unzip), writer);
        }

        //if json file does not exist, convert xml file to json
        if(!fs.existsSync(this.getNowCachePath() + filenamejson)){
            let xml = fs.readFileSync(this.getNowCachePath() + filenamexml)
            let json = await xml2js.parseStringPromise(xml)
            fs.writeFileSync(this.getNowCachePath() + filenamejson, JSON.stringify(json))
        }

        return this.getNowCachePath() + filenamejson
    }

    getAidByTitle(title: string): number | null{
        this.checkAll()
        let obj = this.inMemoryJson.find((titleObj) => titleObj.title == title)
        return obj ? obj.aid : null
    }

    searchTitle(title: string): AnimeTitle[]{
        this.checkAll()

        const miniSearchResult = this.miniSearch.search(title, {
            fuzzy: 0.2
        })

        let results: AnimeTitle[] = []
        for(let result of miniSearchResult){
            let obj = this.inMemoryJson.find((titleObj) => titleObj.hash == result.id)
            if(obj) results.push(obj)
        }

        return results
    }

    suggestTitle(title: string): Suggestion[]{
        this.checkAll()

        return this.miniSearch.autoSuggest(title, {
            fuzzy: 0.2
        })
    }

    getTitlesByAid(aid: number): AnimeTitle[]{
        this.checkAll()
        let titles = this.inMemoryJson.filter((titleObj) => titleObj.aid == aid)
        return titles
    }

    getTitles(title: string, lang?: string, type?: string): AnimeTitle[]{
        this.checkAll()
        const aid = this.getAidByTitle(title)

        if(aid){
            let titles = this.getTitlesByAid(aid)
            if(lang) titles = titles.filter((titleObj) => titleObj.lang == lang)
            if(type) titles = titles.filter((titleObj) => titleObj.type == type)

            return titles
        }

        return []
    }
}