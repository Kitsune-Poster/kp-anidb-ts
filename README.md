# KP AniDB TS 
[![Strict TypeScript Checked](https://badgen.net/badge/TS/TypeScript "Strict TypeScript Checked")](https://www.typescriptlang.org)

This is a Typescript library for the AniDB API. First, read the [AniDB API documentation](https://wiki.anidb.net/HTTP_API_Definition) to understand how the API works and what you can do with it.

## Run demo
> [!IMPORTANT]
> To use this library, you need to have a client name and a client version. You can get them by registering your client on the [animeDB website](https://anidb.net/perl-bin/animedb.pl?show=client).

Create a `.config` file in the root of the project and add the following lines
```config
[Client]
name=your-client-name
version=1
```

After that, run the following command to install the dependencies
```bash
npm i
```

And finally, run the demo
```bash
npm run demo
```

## Installation
To install the library, run the following command
```bash
npm install @nathangasc/kp-anidb-ts
```

And then import it in your code
```typescript
import { KSAniDB } from "@nathangasc/kp-anidb-ts"

const main = async () => {
    let db = KSAniDB.builder()
        .setClient("your-client-name")
        .setClientVer(1) //your client version
        .build()

    await db.init()

    const titles = db.searchTitle("utawareru")
    console.log(titles)
}

main()
```

> [!CAUTION]
> Your client name and version are sensitive information. Do not share them, use them in public repositories, or expose them in a web application. Use this library in a server-side application where you can keep your client name and version safe.

## Usage
This library abstracts the AniDB API and provides a simple way to interact with it by giving you a set of utility functions.

## Abstraction features
- **Caching**: The library caches the responses from the API to avoid unnecessary requests.
- **Rate limiting**: The library respects the rate limits of the API and will wait for the necessary time before making a new request.