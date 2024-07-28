export interface AnimeDetailOriginalJson {
    anime: Anime
}

export interface Anime {
    $: GeneratedType
    type: string[]
    episodecount: string[]
    startdate: string[]
    enddate: string[]
    titles: Title[]
    relatedanime: Relatedanime[]
    similaranime: Similaranime[]
    recommendations: Recommendation[]
    url: string[]
    creators: Creator[]
    description: string[]
    ratings: Rating[]
    picture: string[]
    resources: Resource[]
    tags: Tag[]
    characters: Character[]
    episodes: Episode[]
}

export interface GeneratedType {
    id: string
    restricted: string
}

export interface Title {
    title: Title2[]
}

export interface Title2 {
    _: string
    $: GeneratedType2
}

export interface GeneratedType2 {
    "xml:lang": string
    type: string
}

export interface Relatedanime {
    anime: Anime2[]
}

export interface Anime2 {
    _: string
    $: GeneratedType3
}

export interface GeneratedType3 {
    id: string
    type: string
}

export interface Similaranime {
    anime: Anime3[]
}

export interface Anime3 {
    _: string
    $: GeneratedType4
}

export interface GeneratedType4 {
    id: string
    approval: string
    total: string
}

export interface Recommendation {
    $: GeneratedType5
    recommendation: Recommendation2[]
}

export interface GeneratedType5 {
    total: string
}

export interface Recommendation2 {
    _: string
    $: GeneratedType6
}

export interface GeneratedType6 {
    type: string
    uid: string
}

export interface Creator {
    name: Name[]
}

export interface Name {
    _: string
    $: GeneratedType7
}

export interface GeneratedType7 {
    id: string
    type: string
}

export interface Rating {
    permanent: Permanent[]
    temporary: Temporary[]
    review: Review[]
}

export interface Permanent {
    _: string
    $: GeneratedType8
}

export interface GeneratedType8 {
    count: string
}

export interface Temporary {
    _: string
    $: GeneratedType9
}

export interface GeneratedType9 {
    count: string
}

export interface Review {
    _: string
    $: GeneratedType10
}

export interface GeneratedType10 {
    count: string
}

export interface Resource {
    resource: Resource2[]
}

export interface Resource2 {
    $: GeneratedType11
    externalentity: Externalentity[]
}

export interface GeneratedType11 {
    type: string
}

export interface Externalentity {
    identifier?: string[]
    url?: string[]
}

export interface Tag {
    tag: Tag2[]
}

export interface Tag2 {
    $: GeneratedType12
    name: string[]
    description?: string[]
    picurl?: string[]
}

export interface GeneratedType12 {
    id: string
    parentid?: string
    infobox?: string
    weight: string
    localspoiler: string
    globalspoiler: string
    verified: string
    update: string
}

export interface Character {
    character: Character2[]
}

export interface Character2 {
    $: GeneratedType13
    rating: Rating2[]
    name: string[]
    gender: string[]
    charactertype: Charactertype[]
    description?: string[]
    picture: string[]
    seiyuu?: Seiyuu[]
}

export interface GeneratedType13 {
    id: string
    type: string
    update: string
}

export interface Rating2 {
    _: string
    $: GeneratedType14
}

export interface GeneratedType14 {
    votes: string
}

export interface Charactertype {
    _: string
    $: GeneratedType15
}

export interface GeneratedType15 {
    id: string
}

export interface Seiyuu {
    _: string
    $: GeneratedType16
}

export interface GeneratedType16 {
    id: string
    picture: string
}

export interface Episode {
    episode: Episode2[]
}

export interface Episode2 {
    $: GeneratedType17
    epno: Epno[]
    length: string[]
    rating?: Rating3[]
    title: Title3[]
    airdate?: string[]
    summary?: string[]
    resources?: Resource3[]
}

export interface GeneratedType17 {
    id: string
    update: string
    recap?: string
}

export interface Epno {
    _: string
    $: GeneratedType18
}

export interface GeneratedType18 {
    type: string
}

export interface Rating3 {
    _: string
    $: GeneratedType19
}

export interface GeneratedType19 {
    votes: string
}

export interface Title3 {
    _: string
    $: GeneratedType20
}

export interface GeneratedType20 {
    "xml:lang": string
}

export interface Resource3 {
    resource: Resource4[]
}

export interface Resource4 {
    $: GeneratedType21
    externalentity: Externalentity2[]
}

export interface GeneratedType21 {
    type: string
}

export interface Externalentity2 {
    identifier: string[]
}  