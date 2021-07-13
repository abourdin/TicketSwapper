import { AvailableListing } from './ticket'
import { postRequest } from './request'

export type CartAddResponse = {
  data: {
    addTicketsToCart: {
      cart: { id: string; __typename: string }[]
      errors: any[]
      __typename: string
    }
  }
}

export async function addTicket(
  token: string,
  { listingId, hash, amountOfTickets }: AvailableListing
): Promise<CartAddResponse[]> {
  const body = [
    {
      operationName: 'addTicketsToCart',
      variables: {
        input: {
          listingId,
          listingHash: hash,
          amountOfTickets,
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
