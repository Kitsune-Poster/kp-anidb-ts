import { KSAniDB } from "../KSAniDB"
import { KSAniDBBuilderClientVer } from "./KSAniDBBuilderClientVer"
import { Download } from "../types/Download"
import { Cache } from "../types/Cache"

export class KSAniDBBuilderOptional{
    constructor(private builder: KSAniDBBuilderClientVer){}

    private protover: number = 1
    private download: Download = {
        url: new URL('http://anidb.net/api/anime-titles.xml.gz'),
        path: "./cache"
    }
    private cache: Cache = {
        path: "./cache"
    }

    private domain: string = `http://api.anidb.net:9001`

    setDomain(url: string){
        this.domain = url
        return this
    }

    setProtoVer(protover: number){
        this.protover = protover
        return this
    }

    setDownloadUrl(url: URL){
        this.download.url = url
        return this
    }

    setDownloadPath(path: string){
        this.download.path = path
        return this
    }

    setCachePath(path: string){
        this.cache.path = path
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