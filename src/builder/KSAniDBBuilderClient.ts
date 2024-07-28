import { KSAniDBBuilderClientVer } from "./KSAniDBBuilderClientVer"

/**
 * This class is responsible for setting the client to be used in the requests.
 */
export class KSAniDBBuilderClient{
    private client: string|undefined
    
    setClient(client: string){
        this.client = client
        return new KSAniDBBuilderClientVer(this)
    }
}