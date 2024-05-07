export interface TSearchResults {
  "search-results": SearchResults
}

export interface SearchResults {
  "opensearch:totalResults": string
  "opensearch:startIndex": string
  "opensearch:itemsPerPage": string
  "opensearch:Query": OpensearchQuery
  link: Link[]
  entry: Entry[]
}

export interface OpensearchQuery {
  "@role": string
  "@searchTerms": string
  "@startPage": string
}

export interface Link {
  "@_fa": string
  "@ref": string
  "@href": string
  "@type": string
}

export interface ErrorEntry {
  "@_fa": string
  error: string
}

export interface Entry {
  "@_fa": string
  link: Link2[]
  error?: string
  "prism:url": string
  "dc:identifier": string
  eid: string
  "dc:title": string
  "dc:creator": string
  "prism:publicationName": string
  "prism:issn"?: string
  "prism:volume": string
  "prism:pageRange"?: string
  "prism:coverDate": string
  "prism:coverDisplayDate": string
  "prism:doi"?: string
  pii?: string
  "citedby-count": string
  affiliation: Affiliation[]
  "prism:aggregationType": string
  subtype: string
  subtypeDescription: string
  "article-number"?: string
  "source-id": string
  openaccess: string
  openaccessFlag: boolean
  freetoread?: Freetoread
  freetoreadLabel?: FreetoreadLabel
  "prism:eIssn"?: string
  "prism:issueIdentifier"?: string
  "pubmed-id"?: string
}

export interface SearchEntry {
  scopusId: string
  title: string
  // author: string
}

export interface Link2 {
  "@_fa": string
  "@ref": string
  "@href": string
}

export interface Affiliation {
  "@_fa": string
  affilname: string
  "affiliation-city": string
  "affiliation-country": string
}

export interface Freetoread {
  value: Value[]
}

export interface Value {
  $: string
}

export interface FreetoreadLabel {
  value: Value2[]
}

export interface Value2 {
  $: string
}
