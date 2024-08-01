import * as fs from 'fs'
import * as xml2js from 'xml2js'
import { pipeline } from 'node:stream';
import { promisify } from 'node:util'
import zlib = require("node:zlib");
import MiniSearch, { SearchResult, Suggestion } from 'minisearch'
import hash from 'hash-it';
import { KSAniDBBuilderClient } from './builder/KSAniDBBuilderClient';
import { AnimeTitleOriginalJson } from './types/AnimeTitleOriginalJson';
import { AnimeTitleTransformedJson } from './types/AnimeTitleTransformedJson';
import { AnimeTitle } from './AnimeTitle';
import { AniDBRequester } from './AniDBRequester';
import { AnimeHotOriginalJson } from './types/AnimeHotOriginalJson';
import { AnimeMainOriginalJson } from './types/AnimeMainOriginalJson';
import { AnimeRandomSimilarOriginalJson } from './types/AnimeRandomSimilarOriginalJson';
import { AnimeFetchRecommendationOriginalJson } from './types/AnimeFetchRecommendationOriginalJson';

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
    static builder() {
        return new KSAniDBBuilderClient()
    }

    private isInitialized = false
    private inMemoryJson: AnimeTitleTransformedJson = []
    private miniSearch = new MiniSearch({
        fields: ['title'],
        storeFields: ['title', 'aid', 'lang', 'type'],
        idField: 'hash',
    })

    async init() {
        if (!this.isInitialized) {
            const jsonPath = await this.downloadAid()
            const original = JSON.parse(fs.readFileSync(jsonPath).toString())
            this.inMemoryJson = this.jsonOriginalToTransformed(original)
            this.miniSearch.addAll(this.inMemoryJson)

            this.isInitialized = true
        } else {
            throw new Error("Already initialized")
        }
    }

    private jsonOriginalToTransformed(json: AnimeTitleOriginalJson): AnimeTitleTransformedJson {
        let transformed: AnimeTitleTransformedJson = []

        for (let anime of json.animetitles.anime) {
            let aid = parseInt(anime.$.aid)
            for (let title of anime.title) {
                let id = hash({ aid: aid, title: title._, type: title.$.type, lang: title.$["xml:lang"] })
                transformed.push(new AnimeTitle(
                    this.aniDBRequesterConfig,
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

    private checkInit() {
        if (!this.isInitialized) {
            throw new Error("Not initialized")
        }
    }

    private async assureAidPresence() {
        if (!fs.existsSync(this.getCacheFolder() + "/anime-titles.json")) {
            this.isInitialized = false
            this.inMemoryJson = []
            this.miniSearch.removeAll()
            await this.init()
        }
    }

    private async checkAll() {
        this.checkInit()
        await this.assureAidPresence()
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
    private async downloadAid(): Promise<string> {
        let filename = "anime-titles"
        let filenamexml = filename + ".xml"
        let filenamegz = filenamexml + ".gz"
        let filenamejson = filename + ".json"

        if (!fs.existsSync(this.aniDBRequesterConfig.download.path)) fs.mkdirSync(this.aniDBRequesterConfig.download.path)
        if (!fs.existsSync(this.getCacheFolder())) fs.mkdirSync(this.getCacheFolder())

        //if gz file does not exist, download it
        if (!fs.existsSync(this.getCacheFolder() + "/" + filenamegz)) {
            const response = await fetch(this.aniDBRequesterConfig.download.url)
            if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
            const body = response.body
            if (!body) throw new Error("No body")

            const writer = fs.createWriteStream(this.getCacheFolder() + "/" + filenamegz)

            await streamPipeline(response.body, writer);
        }

        //if xml file does not exist, extract gz file 
        if (!fs.existsSync(this.getCacheFolder() + "/" + filenamexml)) {
            const unzip = zlib.createUnzip();
            const reader = fs.createReadStream(this.getCacheFolder() + "/" + filenamegz);
            const writer = fs.createWriteStream(this.getCacheFolder() + "/" + filenamexml);
            await streamPipeline(reader.pipe(unzip), writer);
        }

        //if json file does not exist, convert xml file to json
        if (!fs.existsSync(this.getCacheFolder() + "/" + filenamejson)) {
            let xml = fs.readFileSync(this.getCacheFolder() + "/" + filenamexml)
            let json = await xml2js.parseStringPromise(xml)
            fs.writeFileSync(this.getCacheFolder() + "/" + filenamejson, JSON.stringify(json))
        }

        return this.getCacheFolder() + "/" + filenamejson
    }

    async getAidByTitle(title: string): Promise<number | null> {
        await this.checkAll()
        let obj = this.inMemoryJson.find((titleObj) => titleObj.title == title)
        return obj ? obj.aid : null
    }

    async searchTitle(title: string): Promise<AnimeTitle[]> {
        await this.checkAll()

        const miniSearchResult = this.miniSearch.search(title, {
            fuzzy: 0.2
        })

        let results: AnimeTitle[] = []
        for (let result of miniSearchResult) {
            let obj = this.inMemoryJson.find((titleObj) => titleObj.hash == result.id)
            if (obj) results.push(obj)
        }

        return results
    }

    async suggestTitle(title: string): Promise<Suggestion[]> {
        await this.checkAll()

        return this.miniSearch.autoSuggest(title, {
            fuzzy: 0.2
        })
    }

    async getTitlesByAid(aid: number): Promise<AnimeTitle[]> {
        await this.checkAll()
        let titles = this.inMemoryJson.filter((titleObj) => titleObj.aid == aid)
        return titles
    }

    async getTitlesByTitle(title: string): Promise<AnimeTitle[]> {
        await this.checkAll()
        const aid = await this.getAidByTitle(title)

        if (aid) {
            let titles = this.getTitlesByAid(aid)

            return titles
        }

        return []
    }

    async getTitles(): Promise<AnimeTitle[]> {
        await this.checkAll()
        return this.inMemoryJson
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Please note, however, that the 'random recommendations' are, in fact, random. Please do not expect random 
     * results here to match random results there.
     * @returns 
     */
    async fetchRecommendation(): Promise<AnimeFetchRecommendationOriginalJson> {
        return super.fetchRecommendation()
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Please note, however, that the 'random similar' are, in fact, random. Please do not expect random results 
     * here to match random results there.
     * @returns 
     */
    async fetchRandomSimilar(): Promise<AnimeRandomSimilarOriginalJson> {
        return super.fetchRandomSimilar()
    }

    /**
     * This command mirrors the type of data provided on the main web page. Use this instead of scraping the HTML. 
     * Unlike the two random result commands, the results here will match the results as supplied by the main web 
     * page (with some possible variance of a few hours, depending on cache life.)
     * @returns 
     */
    async fetchHotAnime(): Promise<AnimeHotOriginalJson> {
        return super.fetchHotAnime()
    }

    /**
     * A one-stop command returning the combined results of random recommendation, random similar, and hot anime. 
     * Use this command instead of scraping the HTML, and if you need more than one of the individual replies.
     * @returns 
     */
    async fetchMain(): Promise<AnimeMainOriginalJson> {
        return super.fetchMain()
    }
}