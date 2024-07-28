import * as fs from 'fs'
import * as xml2js from 'xml2js'
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import zlib = require("node:zlib");
import MiniSearch from 'minisearch'
import hash from 'hash-it';
import { KSAniDBBuilderClient } from './builder/KSAniDBBuilderClient';
import { AnimeTitleOriginalJson } from './types/AnimeTitleOriginalJson';
import { Download } from './types/Download';
import { Cache } from './types/Cache';
import { AnimeTitleTransformedJson } from './types/AnimeTitleTransformedJson';

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
export class KSAniDB{
    /**
     * A builder utility to create a new KSAniDB instance
     * @returns A new KSAniDBBuilderClient instance to build a new KSAniDB instance
     */
    static builder(){
        return new KSAniDBBuilderClient()
    }

    constructor(
        private client: string,
        private clientver: number,
        private protover: number,
        private download: Download,
        private cache: Cache,
        private baseurl: string
    ){
        function removeSlash(path: string){
            return path.replace(/\/$/, "")
        }

        this.download.path = removeSlash(this.download.path)
        this.cache.path = removeSlash(this.cache.path)
    }

    private baseUrl = `http://api.anidb.net:9001/httpapi?client=${this.client}&clientver=${this.clientver}&protover=${this.protover}`
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
                transformed.push({
                    hash: id,
                    aid: aid,
                    title: title._,
                    type: title.$.type,
                    lang: title.$["xml:lang"]
                })
            }
        }

        return transformed
    }

    private async reinit(){
        this.isInitialized = false
        this.init()
    }

    private checkInit(){
        if(!this.isInitialized){
            throw new Error("Not initialized")
        }
    }

    private isUpdateNeeded(){
        let now = new Date()
        let filename = "anime-titles"
        let filenamejson = filename + ".json"
        let nowDownloadPath = this.download.path + "/" + now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate() + "/"

        if(!fs.existsSync(nowDownloadPath + filenamejson)){
            return true
        }

        return false
    }

    private checkForUpdate(){
        if(this.isUpdateNeeded()){
            this.reinit()
        }
    }

    private checkAll(){
        this.checkInit()
        this.checkForUpdate()
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
        let now = new Date()
        let filename = "anime-titles"
        let filenamexml = filename + ".xml"
        let filenamegz = filenamexml + ".gz"
        let filenamejson = filename + ".json"
        let nowDownloadPath = this.download.path + "/" + now.getFullYear() + "." + (now.getMonth() + 1) + "." + now.getDate() + "/"

        if(!fs.existsSync(this.download.path)) fs.mkdirSync(this.download.path)
        if(!fs.existsSync(nowDownloadPath)) fs.mkdirSync(nowDownloadPath)

        //if gz file does not exist, download it
        if(!fs.existsSync(nowDownloadPath + filenamegz)){
            const response = await fetch(this.download.url)
            if(!response.ok) throw new Error(`unexpected response ${response.statusText}`)
            const body = response.body
            if(!body) throw new Error("No body")

            const writer = fs.createWriteStream(nowDownloadPath + filenamegz)

            await streamPipeline(response.body, writer);
        }

        //if xml file does not exist, extract gz file 
        if(!fs.existsSync(nowDownloadPath + filenamexml)){
            const unzip = zlib.createUnzip();
            const reader = fs.createReadStream(nowDownloadPath + filenamegz);
            const writer = fs.createWriteStream(nowDownloadPath + filenamexml);
            await streamPipeline(reader.pipe(unzip), writer);
        }

        //if json file does not exist, convert xml file to json
        if(!fs.existsSync(nowDownloadPath + filenamejson)){
            let xml = fs.readFileSync(nowDownloadPath + filenamexml)
            let json = await xml2js.parseStringPromise(xml)
            fs.writeFileSync(nowDownloadPath + filenamejson, JSON.stringify(json))
        }

        return nowDownloadPath + filenamejson
    }

    getAidByTitle(title: string){
        this.checkAll()
        let obj = this.inMemoryJson.find((titleObj) => titleObj.title == title)
        return obj ? obj.aid : null
    }

    searchTitle(title: string){
        this.checkAll()

        return this.miniSearch.search(title, {
            fuzzy: 0.2
        })
    }

    searchTitleAutoSuggestions(title: string){
        this.checkAll()

        return this.miniSearch.autoSuggest(title, {
            fuzzy: 0.2
        })
    }

    getTitlesByAid(aid: number){
        this.checkAll()
        let titles = this.inMemoryJson.filter((titleObj) => titleObj.aid == aid)
        return titles
    }

    getTitles(title: string, lang?: string, type?: string){
        this.checkAll()
        const aid = this.getAidByTitle(title)

        if(aid){
            let titles = this.getTitlesByAid(aid)
            if(lang) titles = titles.filter((titleObj) => titleObj.lang == lang)
            if(type) titles = titles.filter((titleObj) => titleObj.type == type)

            return titles
        }

        return null
    }
}