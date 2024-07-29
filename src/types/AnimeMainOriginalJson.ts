export interface AnimeMainOriginalJson {
    main: Main
  }
  
  export interface Main {
    hotanime: Hotanime[]
    randomsimilar: Randomsimilar[]
    randomrecommendation: Randomrecommendation[]
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
  
  export interface Randomsimilar {
    similar: Similar[]
  }
  
  export interface Similar {
    source: Source[]
    target: Target[]
  }
  
  export interface Source {
    $: GeneratedType6
    title: Title2[]
    picture: string[]
  }
  
  export interface GeneratedType6 {
    aid: string
    restricted: string
  }
  
  export interface Title2 {
    _: string
    $: GeneratedType7
  }
  
  export interface GeneratedType7 {
    "xml:lang": string
    type: string
  }
  
  export interface Target {
    $: GeneratedType8
    title: Title3[]
    picture: string[]
  }
  
  export interface GeneratedType8 {
    aid: string
    restricted: string
  }
  
  export interface Title3 {
    _: string
    $: GeneratedType9
  }
  
  export interface GeneratedType9 {
    "xml:lang": string
    type: string
  }
  
  export interface Randomrecommendation {
    recommendation: Recommendation[]
  }
  
  export interface Recommendation {
    anime: Anime2[]
  }
  
  export interface Anime2 {
    $: GeneratedType10
    type: string[]
    episodecount: string[]
    startdate: string[]
    enddate: string[]
    title: Title4[]
    picture: string[]
    ratings: Rating2[]
  }
  
  export interface GeneratedType10 {
    id: string
    restricted: string
  }
  
  export interface Title4 {
    _: string
    $: GeneratedType11
  }
  
  export interface GeneratedType11 {
    "xml:lang": string
    type: string
  }
  
  export interface Rating2 {
    permanent: Permanent2[]
    recommendations: string[]
  }
  
  export interface Permanent2 {
    _: string
    $: GeneratedType12
  }
  
  export interface GeneratedType12 {
    count: string
  }
  