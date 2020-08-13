const express = require('express')
const request = require('request');
const cheerio = require('cheerio');
const cors = require('cors')
const server = express()
const port = process.env.PORT || 5555
const url = 'http://asset.led.go.th/newbid/asset_search_province.asp?search_asset_type_id=&search_tumbol=&search_ampur=&search_province=%A1%C3%D8%A7%E0%B7%BE&search_sub_province=&search_price_begin=&search_price_end=&search_bid_date=&search_rai=&search_rai_if=1&search_quaterrai=&search_quaterrai_if=1&search_wa=&search_wa_if=1&search_status=1&search_person1=&search=ok'

server.use(cors())

server.get('/', (req, res) => {
  res.send({
    status: 'success',
    response: 'Welcome to LED Assets API.',
  },
    200,
  )
})

server.get('/latest', (req, res) => {
  request(url, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html, { decodeEntities: false })
      let data = []
      let rows = $('table.table.linkevent tr').toArray()
      let i =0
      rows.forEach(element => {
        let cols = $(element.name + ' td').toArray();
        let asset = [];
        cols.forEach(col=>{
          asset.push($(col).text());
        });
        data.push(asset)
      });
      res.send({
        status: 'success',
        response: {
          'data': data
        }
      },
        200,
      )
    } else {
      res.send({
        status: 'failure',
        response: 'Service is unavailable, Please try again later.',
      },
        404,
      )
    }
  })
})

server.get('*', (req, res) => {
  res.send({
    status: 'failure',
    response: 'route not found.',
  },
    404,
  )
})

server.listen(port, () => console.log('Server running at port %d.', port))