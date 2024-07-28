import { KSAniDBBuilderClient } from "./KSAniDBBuilderClient"
import { KSAniDBBuilderOptional } from "./KSAniDBBuilderOptional"

export class KSAniDBBuilderClientVer{
    constructor(private builder: KSAniDBBuilderClient){}
    private clientver: number|undefined

    setClientVer(clientver: number){
        this.clientver = clientver
        return new KSAniDBBuilderOptional(this)
    }
}