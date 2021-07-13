import * as _ from 'lodash'
import { EventData } from './event'
import * as Cart from './cart'
import notifier from 'node-notifier'

export type AvailableListing = {
  hash: string
  listingId: string
  amountOfTickets: number
}

export function getAvailableTickets(
  eventData: EventData,
  ticketOption: number
): AvailableListing[] {
  const edge = ticketOption - 1
  const nodes = _.get(
    eventData,
    `[0].data.node.event.types.edges.[${edge}].node.availableListings.edges`,
    _.get(
      eventData,
      `[0].data.node.types.edges.[${edge}].node.availableListings.edges`,
      _.get(eventData, `[0].data.node.availableListings.edges`, [])
    )
  )

  return nodes.map((node) => {
    console.log(new Date(), JSON.stringify(node))
    console.log(
      new Date(),
      JSON.stringify({
        listingId: _.get(node, 'node.id'),
        hash: _.get(node, 'node.hash'),
        amountOfTickets: _.get(node, 'node.tickets.edges', []).length || 1,
      })
    )
    return {
      listingId: _.get(node, 'node.id'),
      hash: _.get(node, 'node.hash'),
      amountOfTickets: _.get(node, 'node.tickets.edges', []).length || 1,
    }
  })
}

export async function buyTicketsInListing(
  token: string,
  listing: AvailableListing
): Promise<boolean> {
  const result = await Cart.addTicket(token, {
    listingId: listing.listingId,
    hash: listing.hash,
    amountOfTickets: listing.amountOfTickets,
  })

  const cartId = _.get(result, '[0].data.addTicketsToCart.cart.id')
  const errors = _.get(result, '[0].errors', []).concat(
    _.get(result, '[0].data.addTicketsToCart.errors', [])
  )

  if (errors && errors.length > 0) {
    const extensionsErrorCode =
      errors[0].extensions && errors[0].extensions.code
    const message = [errors[0].code, extensionsErrorCode, errors[0].message]
      .filter((m) => m)
      .join(' - ')

    console.log(new Date(), 'Could not add tickets(s) to card:', message)
  } else if (cartId) {
    const msg = `Added ${listing.amountOfTickets} tickets from listing ${listing.listingId} to cart`
    console.log(new Date(), msg)
    notifier.notify(msg)
    return true
  }
  return false
}
