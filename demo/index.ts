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
        .setRateLimit(1, 2000, true)
        .setCache("./cache", 1000 * 60 * 60 * 24, true)
        .build()

    await db.init()

    const utawarerumonoSearch = db.searchTitle("Utawarerumono")
    let utawarerumono = await utawarerumonoSearch[0].fetchDetails()
    let rating = utawarerumono.anime.ratings[0].permanent[0]._
    console.log(`Utawarerumono rating: ${rating}`)
    
    const main = await db.fetchRecommendation()
    const recommendations = main.randomrecommendation.recommendation
    for(let recommendation of recommendations){
        console.log(`Recommendation: ${recommendation.anime[0].title[0]._}`)
    }
}

main()