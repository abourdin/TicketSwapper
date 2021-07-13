import { start } from './start'

import yargs from 'yargs'

import cluster from 'cluster'

const numCPUs = require('os').cpus().length

const argv = yargs
  .option('url', {
    alias: 'u',
    description: 'Event URL',
    type: 'string',
  })
  .option('cluster', {
    alias: 'c',
    description:
      'Cluster mode, starts multiple connections at once. Attention, might get you banned',
    type: 'boolean',
  })
  .option('ticketoption', {
    alias: 'o',
    description: 'Event ticket option, starts at 1',
    type: 'number',
  })
  .option('token', {
    alias: 't',
    description: 'Ticketswap token',
    type: 'string',
  })
  .demandOption(['t'])
  .help()
  .alias('help', 'h').argv

if (argv.cluster && cluster.isMaster) {
  console.info(`Start in cluster mode, spawning ${numCPUs} processes.`)
  console.log(`Master ${process.pid} is running`)

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  start({
    url: argv.url,
    token: argv.token,
    ticketOption: argv.ticketoption,
  })
}
