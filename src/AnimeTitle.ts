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

    /**
     * Allows retrieval of non-file or episode related information for a specific anime by AID (AniDB anime id).
     * @returns 
     */
    async fetchDetails(){
        return this.fetchAnimeDetails(this.aid)
    }
}