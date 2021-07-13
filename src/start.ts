import * as _ from 'lodash'
import * as Event from './event'
import * as Ticket from './ticket'

export async function start({
  url,
  token,
  ticketOption = 1,
}: {
  url: string
  token: string
  ticketOption: number
}) {
  if (ticketOption < 1) {
    throw new Error('Ticket option should be at least 1 or higher.')
  }

  const event = await Event.getEventIdFromURL(url)

  async function loop() {
    let data
    if (event.type === 'event') {
      data = await Event.getEventData(event.id)
    } else if (event.type === 'eventType') {
      data = await Event.getEventTypeData(event.id)
    }

    // TODO check how many tickets are currently in the cart
    const availableTickets = Ticket.getAvailableTickets(data, ticketOption)
    for (const ticket of availableTickets) {
      try {
        // TODO improve the amount of tickets that should be bought
        if (await Ticket.buyTicketsInListing(token, ticket)) {
          setTimeout(loop, 5000)
          return
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (availableTickets.length === 0) {
      const eventName = _.get(
        data,
        '[0].data.node.name',
        _.get(data, '[0].data.node.title')
      )
      console.log(new Date(), `${eventName || '#ERROR'} - No tickets`)
      if (!eventName) {
        console.log(new Date(), JSON.stringify(data))
      }
    }
    setTimeout(loop, Math.random() * 1000 + 1000)
  }

  loop()
}
