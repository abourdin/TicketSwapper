import { AvailableTicket } from './ticket'
import { postRequest } from './request'

export type CartAddTicket = {
  hash: AvailableTicket['hash']
  listingId: AvailableTicket['listingId']
}

export type CartAddResponse = {
  data: {
    addTicketsToCart: {
      cart: { id: string; __typename: string }[]
      errors: any[]
      __typename: string
    }
  }
}

async function addTicket(
  token: string,
  { listingId, hash }: CartAddTicket
): Promise<CartAddResponse[]> {
  const body = [
    {
      operationName: 'addTicketsToCart',
      variables: {
        input: {
          listingId: listingId,
          listingHash: hash,
          amountOfTickets: 1,
        },
      },
      query:
        'mutation addTicketsToCart($input: AddTicketsToCartInput!) {  addTicketsToCart(input: $input) {    cart {      id      __typename    }    errors {      code      message      __typename    }    __typename  }}',
    },
  ]

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const result = await postRequest({
    url: 'https://api.ticketswap.com/graphql/public/batch',
    body,
    headers,
  })
  return JSON.parse(result)
}

export const Cart = {
  addTicket,
}
