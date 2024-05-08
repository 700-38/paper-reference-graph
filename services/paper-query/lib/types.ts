export interface TAbsRetRes {
  "abstracts-retrieval-response": AbstractsRetrievalResponse
}

export interface AbstractsRetrievalResponse {
  item: Item
  affiliation: Affiliation3[]
  coredata: Coredata
  idxterms: Idxterms
  language: Language
  authkeywords: Authkeywords
  "subject-areas": SubjectAreas
  authors: Authors
}

export interface Item {
  "ait:process-info": AitProcessInfo
  "xocs:meta": XocsMeta
  bibrecord: Bibrecord
}

export interface AitProcessInfo {
  "ait:status": AitStatus
  "ait:date-delivered": AitDateDelivered
  "ait:date-sort": AitDateSort
}

export interface AitStatus {
  "@state": string
  "@type": string
  "@stage": string
}

export interface AitDateDelivered {
  "@day": string
  "@timestamp": string
  "@year": string
  "@month": string
}

export interface AitDateSort {
  "@day": string
  "@year": string
  "@month": string
}

export interface XocsMeta {
  "xocs:funding-list": XocsFundingList
}

export interface XocsFundingList {
  "@pui-match": string
  "@has-funding-info": string
  "xocs:funding": XocsFunding[]
  "xocs:funding-addon-generated-timestamp": string
  "xocs:funding-text": string
  "xocs:funding-addon-type": string
}

export interface XocsFunding {
  "xocs:funding-agency-matched-string": string
  "xocs:funding-agency-acronym"?: string
  "xocs:funding-agency": string
  "xocs:funding-agency-id": string
  "xocs:funding-agency-country": string
}

export interface Bibrecord {
  head: Head
  "item-info": ItemInfo
  tail: Tail
}

export interface Head {
  "author-group": AuthorGroup[]
  "citation-title": string
  abstracts: string
  correspondence: Correspondence
  "citation-info": CitationInfo
  source: Source
  enhancement: Enhancement
  grantlist: Grantlist
}

export interface AuthorGroup {
  affiliation: Affiliation
  author: Author[]
}

export interface Affiliation {
  country: string
  "@afid": string
  "@country": string
  city: string
  organization: Organization[]
  "affiliation-id": AffiliationId[]
  "@affiliation-instance-id": string
  "ce:source-text": string
  "@dptid": string
}

export interface Organization {
  $: string
}

export interface AffiliationId {
  "@afid": string
  "@dptid"?: string
}

export interface Author {
  "ce:given-name": string
  "preferred-name": PreferredName
  "@author-instance-id": string
  "@seq": string
  "ce:initials": string
  "@_fa": string
  "@type": string
  "ce:surname": string
  "@auid": string
  "@orcid"?: string
  "ce:indexed-name": string
}

export interface PreferredName {
  "ce:given-name": string
  "ce:initials": string
  "ce:surname": string
  "ce:indexed-name": string
}

export interface Correspondence {
  affiliation: Affiliation2
  person: Person
}

export interface Affiliation2 {
  country: string
  "@country": string
  city: string
  organization: Organization2[]
  "@affiliation-instance-id": string
  "ce:source-text": string
}

export interface Organization2 {
  $: string
}

export interface Person {
  "ce:given-name": string
  "@author-instance-id": string
  "ce:initials": string
  "ce:surname": string
  "ce:indexed-name": string
}

export interface CitationInfo {
  "author-keywords": AuthorKeywords
  "citation-type": CitationType
  "citation-language": CitationLanguage
  "abstract-language": AbstractLanguage
}

export interface AuthorKeywords {
  "author-keyword": AuthorKeyword[]
}

export interface AuthorKeyword {
  $: string
  "@xml:lang": string
  "@original": string
}

export interface CitationType {
  "@code": string
}

export interface CitationLanguage {
  "@language": string
  "@xml:lang": string
}

export interface AbstractLanguage {
  "@language": string
  "@xml:lang": string
}

export interface Source {
  website: Website
  "translated-sourcetitle": TranslatedSourcetitle
  volisspag: Volisspag
  "@type": string
  sourcetitle: string
  publicationdate: Publicationdate
  "sourcetitle-abbrev": string
  "@country": string
  issn: Issn
  publicationyear: Publicationyear
  publisher: Publisher
  "article-number": string
  "@srcid": string
}

export interface Website {
  "ce:e-address": CeEAddress
}

export interface CeEAddress {
  $: string
  "@type": string
}

export interface TranslatedSourcetitle {
  $: string
  "@xml:lang": string
}

export interface Volisspag {
  voliss: Voliss
}

export interface Voliss {
  "@volume": string
  "@issue": string
}

export interface Publicationdate {
  month: string
  year: string
  "date-text": string
  day: string
}

export interface Issn {
  $: string
  "@type": string
}

export interface Publicationyear {
  "@first": string
}

export interface Publisher {
  publishername: string
}

export interface Enhancement {
  classificationgroup: Classificationgroup
  chemicalgroup: Chemicalgroup
}

export interface Classificationgroup {
  classifications: Classification[]
}

export interface Classification {
  "@type": string
  classification: any
}

export interface Chemicalgroup {
  chemicals: Chemical[]
}

export interface Chemical {
  "@source": string
  chemical: Chemical2
}

export interface Chemical2 {
  "cas-registry-number"?: string
  "chemical-name": string
}

export interface Grantlist {
  "@complete": string
  "grant-text": GrantText
}

export interface GrantText {
  $: string
  "@xml:lang": string
}

export interface ItemInfo {
  copyright: Copyright
  dbcollection: Dbcollection[]
  history: History
  itemidlist: Itemidlist
}

export interface Copyright {
  $: string
  "@type": string
}

export interface Dbcollection {
  $: string
}

export interface History {
  "date-created": DateCreated
}

export interface DateCreated {
  "@day": string
  "@timestamp": string
  "@year": string
  "@month": string
}

export interface Itemidlist {
  itemid: Itemid[]
  "ce:doi": string
}

export interface Itemid {
  $: string
  "@idtype": string
}

export interface Tail {
  bibliography: Bibliography
}

export interface Bibliography {
  "@refcount": string
  reference: Reference[]
}

export interface Reference {
  "ref-fulltext": string
  "@reference-instance-id": string
  "@id": string
  "ref-info": RefInfo
  "ce:source-text": string
}

export interface RefInfo {
  "ref-publicationyear": RefPublicationyear
  "ref-title": RefTitle
  "refd-itemidlist": RefdItemidlist
  "ref-volisspag": RefVolisspag
  "ref-text"?: string
  "ref-authors": RefAuthors
  "ref-sourcetitle": string
}

export interface RefPublicationyear {
  "@first": string
}

export interface RefTitle {
  "ref-titletext": string
}

export interface RefdItemidlist {
  itemid: Itemid2[]
}

export interface Itemid2 {
  $: string
  "@idtype": string
}

export interface RefVolisspag {
  voliss: Voliss2
  pagerange: Pagerange
}

export interface Voliss2 {
  "@volume": string
  "@issue"?: string
}

export interface Pagerange {
  "@first": string
  "@last"?: string
}

export interface RefAuthors {
  author: Author2[]
  "et-al": any
}

export interface Author2 {
  "@seq": string
  "ce:initials": string
  "@_fa": string
  "ce:surname": string
  "ce:indexed-name": string
}

export interface Affiliation3 {
  "affiliation-city": string
  "@id": string
  affilname: string
  "@href": string
  "affiliation-country": string
}

export interface Coredata {
  srctype: string
  eid: string
  "dc:description": string
  "pubmed-id": string
  "prism:coverDate": string
  "prism:aggregationType": string
  "prism:url": string
  "dc:creator": DcCreator
  link: Link[]
  "source-id": string
  "citedby-count": string
  "prism:volume": string
  subtype: string
  "dc:title": string
  openaccess: string
  "prism:issn": string
  publishercopyright: string
  "article-number": string
  "prism:issueIdentifier": string
  subtypeDescription: string
  "prism:publicationName": string
  openaccessFlag: string
  "prism:doi": string
  "dc:identifier": string
  "dc:publisher": string
}

export interface DcCreator {
  author: Author3[]
}

export interface Author3 {
  "ce:given-name": string
  "preferred-name": PreferredName2
  "@seq": string
  "ce:initials": string
  "@_fa": string
  affiliation: Affiliation4[]
  "ce:surname": string
  "@auid": string
  "author-url": string
  "ce:indexed-name": string
}

export interface PreferredName2 {
  "ce:given-name": string
  "ce:initials": string
  "ce:surname": string
  "ce:indexed-name": string
}

export interface Affiliation4 {
  "@id": string
  "@href": string
}

export interface Link {
  "@_fa": string
  "@rel": string
  "@href": string
}

export interface Idxterms {
  mainterm: Mainterm[]
}

export interface Mainterm {
  $: string
  "@weight": string
  "@candidate": string
}

export interface Language {
  "@xml:lang": string
}

export interface Authkeywords {
  "author-keyword": AuthorKeyword2[]
}

export interface AuthorKeyword2 {
  "@_fa": string
  $: string
}

export interface SubjectAreas {
  "subject-area": SubjectArea[]
}

export interface SubjectArea {
  "@_fa": string
  $: string
  "@code": string
  "@abbrev": string
}

export interface Authors {
  author: Author4[]
}

export interface Author4 {
  "ce:given-name": string
  "preferred-name": PreferredName3
  "@seq": string
  "ce:initials": string
  "@_fa": string
  affiliation: Affiliation5[]
  "ce:surname": string
  "@auid": string
  "author-url": string
  "ce:indexed-name": string
}

export interface PreferredName3 {
  "ce:given-name": string
  "ce:initials": string
  "ce:surname": string
  "ce:indexed-name": string
}

export interface Affiliation5 {
  "@id": string
  "@href": string
}
