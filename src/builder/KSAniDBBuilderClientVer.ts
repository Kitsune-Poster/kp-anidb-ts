import { KSAniDBBuilderClient } from "./KSAniDBBuilderClient"
import { KSAniDBBuilderOptional } from "./KSAniDBBuilderOptional"

/**
 * This class is responsible for setting the client version to be used in the requests.
 */
export class KSAniDBBuilderClientVer{
    constructor(private builder: KSAniDBBuilderClient){}
    private clientver: number|undefined

    setClientVer(clientver: number){
        this.clientver = clientver
        return new KSAniDBBuilderOptional(this)
    }
}