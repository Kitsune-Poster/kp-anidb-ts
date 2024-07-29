export interface AnimeHotOriginalJson {
    hotanime: Hotanime
}

export interface Hotanime {
    anime: Anime[]
}

export interface Anime {
    $: GeneratedType
    episodecount?: string[]
    startdate: string[]
    enddate?: string[]
    title: Title[]
    ratings: Rating[]
    picture: string[]
}

export interface GeneratedType {
    id: string
    restricted: string
}

export interface Title {
    _: string
    $: GeneratedType2
}

export interface GeneratedType2 {
    "xml:lang": string
    type: string
}

export interface Rating {
    permanent: Permanent[]
    temporary: Temporary[]
    review?: Review[]
}

export interface Permanent {
    _: string
    $: GeneratedType3
}

export interface GeneratedType3 {
    count: string
}

export interface Temporary {
    _: string
    $: GeneratedType4
}

export interface GeneratedType4 {
    count: string
}

export interface Review {
    _: string
    $: GeneratedType5
}

export interface GeneratedType5 {
    count: string
}