import { KSAniDB } from "../src/index";
import ConfigParser from "configparser";

let config = new ConfigParser()
config.read(".config")
let client = config.get("Client", "client")
let clientVer = config.get("Client", "client_version")
if(client == null || clientVer == null) {
    console.error("Client or Client Version not set in .config file. Did you forget to create a .config file? Refer to the README for more information.")
    process.exit(1)
}else{
    console.log(`Client: ${client} | Client Version: ${clientVer}`)
}

const main = async () => {
    let db = KSAniDB.builder()
        .setClient(client)
        .setClientVer(parseInt(clientVer))
        .setRateLimit(1, 2000)
        .build()

    await db.init()

    const utawarerumonoSearch = db.searchTitle("Utawarerumono")
    await utawarerumonoSearch[0].fetchDetails()
    
    const main = await db.fetchRecommendation()
    console.log(main.randomrecommendation.recommendation[0].anime[0].ratings[0])
}

main()