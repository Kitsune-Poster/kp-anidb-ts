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

### Titles
Titles are downloaded by the library and stored in disk to avoid unnecessary requests to the API (as requested by the API documentation). The list will be updated every 24 hours.

To download the titles, you need to call the `init` method first. If you don't call this method, the library will throw an error when you try to access the titles. If the titles are already downloaded, the library will not download them again.

```typescript
db.init()
```

#### Get titles
Get titles returns the list of titles downloaded by the library.
```typescript
const titles = db.getTitles
```

#### Get titles by AID
Get titles by AID returns the titles of an anime by its AID. 
```typescript
const titles = db.getTitlesByAid(1)
```

#### Get titles by title (exact match)
Get titles by title returns the titles that match the exact title.
```typescript
const titles = db.getTitlesByTitle("utawarerumono")
```

#### Search for title (partial match)
Search for title returns the titles that partially match the title with a matching score.
```typescript
const titles = db.searchTitle("utawareru")
```

#### Suggest titles based on the given entry (partial match)
Suggest titles returns the titles that are similar to the given title.
```typescript
const titles = db.suggestTitle("utawarerumono")
```

### Anime
Anime is the main feature of the AniDB API. It allow to search animes by different criteria. Those are impacted by the rate limits of the API. To avoid too many requests, the library caches the responses from the API for 24 hours (as requested by the API documentation).

#### Get anime details
Get anime details returns the details of an anime by its AID.
```typescript
const title = db.searchTitle("utawareru")[0]
const anime = await title.fetchDetails()
```

#### Get anime hot anime
Get anime hot anime returns the list of hot animes.
```typescript
const hotAnimes = await db.fetchHotAnime()
```

#### Get random anime
Get anime random anime returns a random anime.
```typescript
const randomAnime = await db.fetchRecommendation()
```

#### Get random similar anime
Get random anime similar anime list
```typescript
const similarAnimes = await db.fetchRandomSimilar()
```

#### Get anime on main page
Get anime on displayed on the main page
```typescript
const mainPageAnimes = await db.fetchMain()
```

### User
I've not implemented user related features because it requires to put the user's credentials in an URL which can be retrieved by a man-in-the-middle attack. If you want to use this feature, you can implement it yourself by extending the `KSAniDB` class but I strongly advise against it.

## Abstraction features
- **Caching**: The library caches the responses from the API to avoid unnecessary requests. This cache is updated every 24 hours.
- **Rate limiting**: The library respects the rate limits of the API and will wait for the necessary time before making a new request. If the rate limit is reached, the library will throw an error. You can handle it like this:
```typescript
try {
    const anime = await db.fetchDetails()
} catch (e) {
    if (e instanceof RateLimitError) {
        console.log("Rate limit reached. Waiting for the necessary time.")
    }
}
```