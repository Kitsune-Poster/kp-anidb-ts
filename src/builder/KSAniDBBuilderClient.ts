import { KSAniDBBuilderClientVer } from "./KSAniDBBuilderClientVer"

export class KSAniDBBuilderClient{
    private client: string|undefined
    
    setClient(client: string){
        this.client = client
        return new KSAniDBBuilderClientVer(this)
    }
}