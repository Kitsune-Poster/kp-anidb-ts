export interface AnimeFetchRecommendationOriginalJson {
    randomrecommendation: Randomrecommendation
  }
  
  export interface Randomrecommendation {
    recommendation: Recommendation[]
  }
  
  export interface Recommendation {
    anime: Anime[]
  }
  
  export interface Anime {
    $: GeneratedType
    type: string[]
    episodecount: string[]
    startdate: string[]
    enddate: string[]
    title: Title[]
    picture: string[]
    ratings: Rating[]
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
    recommendations: string[]
  }
  
  export interface Permanent {
    _: string
    $: GeneratedType3
  }
  
  export interface GeneratedType3 {
    count: string
  }
  