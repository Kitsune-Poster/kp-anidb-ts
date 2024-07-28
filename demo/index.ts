import { KSAniDB } from "../dist/index";
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
        .build()

    await db.init()

    const titles = db.searchTitle("utawareru")
    console.log(titles)
}

main()