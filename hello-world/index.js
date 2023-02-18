const http = require('http')
const fs = require('fs')

const server = http.createServer((request, response) => {
  const stream = fs.createReadStream('sample.txt')
  stream.pipe(response)
//   fs.readFile('sample.txt',
//     // eslint-disable-next-line n/handle-callback-err
//     (err, data) => response.end(data.toString())
//   )
})

server.listen(3000)
