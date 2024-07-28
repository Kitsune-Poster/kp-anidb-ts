import { AniDBRequester, AniDBRequesterConfig } from "./AniDBRequester";
import xml2js from 'xml2js';
import { AnimeDetailOriginalJson } from "./types/AnimeDetailOriginalJson";

export class AnimeTitle extends AniDBRequester {
    constructor(
        config: AniDBRequesterConfig,
        public hash: number,
        public aid: number,
        public title: string,
        public type: string,
        public lang: string,
    ){
        super(config)
    }

    async fetchDetails(): Promise<AnimeDetailOriginalJson>{
        let url = `${this.getBaseUrl()}&request=anime&aid=${this.aid}`
        let response = await this.fetch(url)
        let xml = response.body
        let json = await xml2js.parseStringPromise(xml)

        if(json.error){
            throw new Error(json.error)
        }

        return json as AnimeDetailOriginalJson
    }
}