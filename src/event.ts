import { postRequest } from './request'
import _ from 'lodash'

export type EventData = any

export async function getData(eventId: string): Promise<EventData> {
  let result: any = await postRequest({
    url: 'https://api.ticketswap.com/graphql/public/batch?flow=',
    body: [
      {
        operationName: 'getEventData',
        variables: {
          id: eventId,
        },
        query:
          'query getEventData($id: ID!) {\n  node(id: $id) {\n    ... on Event {\n      ...event\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment event on Event {\n  ...sharedEventData\n  availableTicketsCount\n  soldTicketsCount\n  ticketAlertsCount\n  cancellationReason\n  isHighlighted\n  entranceTypes: types(first: 99, filter: {ticketCategory: ENTRANCE}) {\n    edges {\n      node {\n        ...eventTypeData\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  nonEntranceTypesWithoutGroup: types(\n    first: 99\n    filter: {ticketCategory: NON_ENTRANCE, hasGroup: false}\n  ) {\n    edges {\n      node {\n        ...eventTypeData\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  eventTypeGroups {\n    id\n    name\n    eventTypes {\n      ...eventTypeData\n      __typename\n    }\n    __typename\n  }\n  redirectedTo {\n    id\n    slug\n    __typename\n  }\n  availableListings: listings(first: 2, filter: {listingStatus: AVAILABLE}) {\n    edges {\n      node {\n        id\n        hash\n        price {\n          originalPrice {\n            ...money\n            __typename\n          }\n          __typename\n        }\n        seller {\n          id\n          avatar\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  soldListings: listings(first: 2, filter: {listingStatus: SOLD}) {\n    edges {\n      node {\n        id\n        seller {\n          id\n          avatar\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  usersWithTicketAlerts(first: 8) {\n    edges {\n      node {\n        id\n        avatar\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  externalPrimaryTicketShops {\n    ...externalPrimaryTicketShop\n    __typename\n  }\n  __typename\n}\n\nfragment sharedEventData on Event {\n  id\n  slug\n  name\n  status\n  isSellingBlocked\n  isBuyingBlocked\n  isPopular\n  category\n  timeZone\n  instagramUsername\n  startDate\n  endDate\n  facebookEventWalls {\n    facebookUrl\n    isMainEventWall\n    __typename\n  }\n  isVerified\n  seoMetadata {\n    title\n    description\n    __typename\n  }\n  description\n  eventVideo {\n    ...eventVideo\n    __typename\n  }\n  closedLoopInformation {\n    ...closedLoopInformation\n    __typename\n  }\n  secureSwapInformation {\n    isManualSecureSwapAvailable\n    __typename\n  }\n  alias {\n    uri {\n      url\n      path\n      __typename\n    }\n    __typename\n  }\n  headerImageUrl\n  imageUrl\n  imageSmallUrl\n  organizerShop {\n    id\n    organizerBranding {\n      name\n      image\n      __typename\n    }\n    hasDynamicProducts\n    __typename\n  }\n  location {\n    id\n    slug\n    name\n    geoInfo {\n      latitude\n      longitude\n      __typename\n    }\n    background\n    amountOfActiveUpcomingEvents\n    image\n    website\n    averageFanExperienceRating\n    totalAmountOfFanExperiences\n    city {\n      id\n      slug\n      name\n      __typename\n    }\n    country {\n      ...country\n      __typename\n    }\n    __typename\n  }\n  organizerBrands {\n    ...organizerBrand\n    __typename\n  }\n  artists {\n    ...artist\n    __typename\n  }\n  types(first: 99) {\n    edges {\n      node {\n        id\n        slug\n        title\n        availableTicketsCount\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  warning {\n    title\n    message\n    url {\n      text\n      url\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment artist on Artist {\n  id\n  name\n  slug\n  avatar\n  numberOfUpcomingEvents\n  isFollowedByViewer\n  __typename\n}\n\nfragment organizerBrand on OrganizerBrand {\n  id\n  name\n  logoUrl\n  isFollowedByViewer\n  displayRequestForMarketingConsent\n  __typename\n}\n\nfragment eventVideo on EventVideo {\n  id\n  platform\n  videoPlatformId\n  videoUrl\n  title\n  thumbnailUrl\n  __typename\n}\n\nfragment closedLoopInformation on ClosedLoopEventInformation {\n  ticketProviderName\n  findYourTicketsUrl\n  __typename\n}\n\nfragment country on Country {\n  name\n  code\n  __typename\n}\n\nfragment eventTypeData on EventType {\n  id\n  slug\n  title\n  startDate\n  endDate\n  availableTicketsCount\n  __typename\n}\n\nfragment externalPrimaryTicketShop on ExternalPrimaryTicketShop {\n  id\n  startDate\n  state\n  shopImageUrl {\n    url\n    trackingUrl\n    path\n    host\n    __typename\n  }\n  shopUrl {\n    url\n    trackingUrl\n    path\n    host\n    __typename\n  }\n  __typename\n}\n\nfragment money on Money {\n  amount\n  currency\n  __typename\n}\n',
      },
    ],
  })
  result = JSON.parse(result)
  return result
}

export function getEventIdsFromURL(url: string) {
  const rawId = getRawIdFromURL(url)

  console.log(`Found id: ${rawId}`)
  const eventType = Buffer.from(`EventType:${rawId}`).toString('base64')
  const eventId = Buffer.from(`Event:${rawId}`).toString('base64')
  return { eventId, eventType }
}

export async function testEventId(id) {
  try {
    const data = await getData(id)
    const result = _.get(data, '[0].data.node.id', null)
    return result === id
  } catch (err) {
    console.error(`This should not have happened.`, err)
    return false
  }
}

export async function getEventIdFromURL(url: string) {
  const { eventType, eventId } = getEventIdsFromURL(url)

  if (await testEventId(eventType)) {
    return eventType
  }

  if (await testEventId(eventId)) {
    return eventId
  }

  throw new Error('Event id could not be used.')
}

function getRawIdFromURL(url: string) {
  if (!url || url.trim().length === 0) {
    throw new Error(`
        URL is format is incorrect. Please specify ULR like:
        Like: 
        https://www.ticketswap.com/event/museumnacht-amsterdam-2019/regular-tickets/6135485a-7ccd-470d-b2ba-61ba58726a92/1450743
        OR
        https://www.ticketswap.com/event/museumnacht-amsterdam-2019/regular-tickets/6135485a-7ccd-470d-b2ba-61ba58726a92
        `)
  }
  const urlSplit = url.split('/')
  return urlSplit[urlSplit.length - 1]
}
