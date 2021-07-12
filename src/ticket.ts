import * as _ from 'lodash'
import { EventData } from './event'
import { Cart } from './cart'
import notifier from 'node-notifier'

export type AvailableTicket = {
  hash: string
  url: string
  listingId: string
}

export function getAvailableTickets(
  eventData: EventData,
  ticketOption: number
): { hash: string; url: string; listingId: string }[] {
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
    const path = _.get(node, 'node.uri.url', '')
    const pathSplit = path.split('?')
    return {
      url: pathSplit[0],
      listingId: _.get(node, 'node.id'),
      hash: _.get(node, 'node.hash'),
    }
  })
}

export async function buyTicket(
  token: string,
  ticket: AvailableTicket
): Promise<boolean> {
  const result = await Cart.addTicket(token, {
    listingId: ticket.listingId,
    hash: ticket.hash,
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

    console.log(new Date(), 'Could not add ticket to card:', message)
  } else if (cartId) {
    const msg = `Added ticket ${ticket.listingId} to cart`
    console.log(new Date(), msg)
    notifier.notify(msg)
    return true
  }
  return false
}
