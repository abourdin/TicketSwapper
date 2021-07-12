import * as _ from 'lodash'
import * as Event from './event'
import * as Ticket from './ticket'

export async function start({
  url,
  id,
  token,
  ticketOption = 1,
}: {
  url: string
  id: string
  token: string
  ticketOption: number
}) {
  if (ticketOption < 1) {
    throw new Error('Ticket option should be at least 1 or higher.')
  }

  const eventId = id || (await Event.getEventIdFromURL(url))

  async function loop() {
    const data = await Event.getData(eventId)

    // TODO check how many tickets are currently in the cart
    const availableTickets = Ticket.getAvailableTickets(data, ticketOption)
    for (const ticket of availableTickets) {
      try {
        // TODO improve the amount of tickets that should be bought
        if (await Ticket.buyTicket(token, ticket)) {
          setTimeout(loop, 5000)
          return
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (availableTickets.length === 0) {
      const eventName = _.get(data, '[0].data.node.name')
      console.log(new Date(), `${eventName || '#ERROR'} - No tickets`)
      if (!eventName) {
        console.log(new Date(), JSON.stringify(data))
      }
    }
    setTimeout(loop, Math.random() * 1000 + 1000)
  }

  loop()
}
