export interface TAbsRetRes {
  "abstracts-retrieval-response": AbstractsRetrievalResponse
}

export interface AbstractsRetrievalResponse {
  references: References
}

export interface References {
  reference: Reference[]
  "@total-references": string
  link: Link[]
}

export interface Reference {
  "scopus-eid": string
  "@_fa": string
  volisspag?: Volisspag
  "prism:coverDate"?: string
  sourcetitle: string
  type: string
  title?: string
  url: string
  "citedby-count"?: string
  "scopus-id": string
  "@id": string
  "ce:doi"?: string
  "author-list"?: AuthorList
  derivedSequence?: string
  "pubmed-id"?: string
  "article-number"?: string
}

export interface Volisspag {
  voliss?: Voliss
  pagerange?: Pagerange
  pagecount?: Pagecount
}

export interface Voliss {
  "@volume": string
  "@issue"?: string
}

export interface Pagerange {
  "@first": string
  "@last"?: string
}

export interface Pagecount {
  $: string
  "@type": string
}

export interface AuthorList {
  author: Author[]
}

export interface Author {
  "ce:given-name"?: string
  "preferred-name"?: PreferredName
  "@seq": string
  "ce:initials": string
  "@_fa": string
  affiliation?: Affiliation
  "ce:surname": string
  "@auid"?: string
  "author-url"?: string
  "@force-array": string
  "ce:indexed-name": string
  "ce:degrees"?: string
  "ce:suffix"?: string
}

export interface PreferredName {
  "ce:given-name": string
  "ce:initials": string
  "ce:surname": string
  "ce:indexed-name": string
}

export interface Affiliation {
  "@id": string
  "@href": string
}

export interface Link {
  "@_fa": string
  "@type": string
  "@ref": string
  "@href": string
}


export interface TServiceErrorRes {
  "service-error": ServiceError
}

export interface ServiceError {
  status: Status
}

export interface Status {
  statusCode: string
  statusText: string
}
