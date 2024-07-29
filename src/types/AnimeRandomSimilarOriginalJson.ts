export interface AnimeRandomSimilarOriginalJson {
  randomsimilar: Randomsimilar
}

export interface Randomsimilar {
  similar: Similar[]
}

export interface Similar {
  source: Source[]
  target: Target[]
}

export interface Source {
  $: GeneratedType
  title: Title[]
  picture: string[]
}

export interface GeneratedType {
  aid: string
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

export interface Target {
  $: GeneratedType3
  title: Title2[]
  picture: string[]
}

export interface GeneratedType3 {
  aid: string
  restricted: string
}

export interface Title2 {
  _: string
  $: GeneratedType4
}

export interface GeneratedType4 {
  "xml:lang": string
  type: string
}
