const { HttpRequestManager } = require('http2-client/lib/request')
const httpRequestManager = new HttpRequestManager({
  keepH2ConnectionFor: 10000,
})

const DEFAULT_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.54',
  accept: '*/*',
  'Accept-Language': 'en',
  referer: 'https://www.ticketswap.com/',
  origin: 'https://www.ticketswap.com',
  dnt: 1,
  pragma: 'no-cache',
  'cache-control': 'no-cache',
  'content-encoding': 'gzip',
}

export async function postRequest({
  url,
  body,
  headers,
}: {
  url: string
  body: { [key: string]: any } | { [key: string]: any }[]
  headers?
}): Promise<string> {
  const postData = JSON.stringify(body)

  const options = {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  }

  return new Promise((resolve, reject) => {
    const req = httpRequestManager.request(url, options, (resp) => {
      let data = ''

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk
      })

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(data)
      })
    })
    req.on('error', (err) => {
      console.log('Error: ' + err.message)
      reject(err)
    })

    req.write(postData)
    req.end()
  })
}
