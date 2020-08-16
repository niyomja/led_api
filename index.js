const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const cors = require('cors')
const iconv  = require('iconv-lite')
const bodyParser = require('body-parser')
const url = require('url')
const { urlencoded } = require('body-parser')
const server = express()
const port = process.env.PORT || 5555

server.use(cors())

let app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

server.get('/', (req, res) => {
  res.status(200)
  res.send({
    status: 'success',
    response: 'Welcome to LED Assets API.',
  })
})

server.get('/search', (req, res) => {
  const query = req.query
  
  let page = query.page ? parseInt(query.page) : 1
  let search_asset_type_id = query.search_asset_type_id ? query.search_asset_type_id : ""
  let search_tumbol = query.search_tumbol ? query.search_tumbol : ""
  let search_ampur = query.search_ampur ? query.search_ampur : ""
  let search_province = query.search_province ? query.search_province : ""
  let search_sub_province = query.search_sub_province ? query.search_sub_province : ""
  let search_price_begin = query.search_price_begin ? query.search_price_begin : ""
  let search_price_end = query.search_price_end ? query.search_price_end : ""
  let search_bid_date = query.search_bid_date ? query.search_bid_date : ""
  let search_rai = query.search_rai ? query.search_rai : ""
  let search_wa = query.search_wa ? query.search_wa : ""

  let request_url = 'http://asset.led.go.th/newbid/asset_search_province.asp?search_rai_if=1&search_quaterrai=&search_quaterrai_if=1&search_wa_if=1&search_status=1&search_person1=&search=ok'

  request_url = request_url + 
                '&search_asset_type_id=' + search_asset_type_id + 
                '&page=' + page +
                '&search_tumbol=' + search_tumbol +
                '&search_ampur=' + search_ampur +
                '&search_province=' + search_province +
                '&search_sub_province=' + search_sub_province +
                '&search_price_begin=' + search_price_begin +
                '&search_price_end=' + search_price_end +
                '&search_bid_date=' + search_bid_date +
                '&search_rai=' + search_rai +
                '&search_wa=' + search_wa

  var option = {
    uri: request_url,
    encoding: null,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36',
        'Referrer': "..."
    }
  }

  request(option, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var utf8String = iconv.decode(new Buffer(body), "TIS-620");
      const $ = cheerio.load(utf8String)
      let data = []
      let rows = $('table.table.linkevent tr[onclick]').toArray()
      let found = $('div.linkevent div strong font font').text().replace('ผลการค้นหา \n\t\t\t\t\t\t\t\t\t  พบ', '').replace('\n\t\t\t\t\t\t\t\t\t  รายการ', '').trim()
      let total_records = parseInt(found)
      let total_page = Math.ceil(total_records/50) 

      rows.forEach(element => {
        let onclick = $(element).attr('onclick').replace(/ /g,"")
        let cols = $(element).find('td').toArray()
        let asset = {};
        
        let word = "',null,'width=1300,height=900,status=yes,toolbar=no,menubar=yes,location=no,scrollbars=yes,resizable=yes');returnfalse;"
        asset.AssetDetailUrl = "http://asset.led.go.th/newbid/" + onclick.replace(/window.open\(\'/g,"").replace(word, "")
        asset.PhotoUrl = ""
        asset.MapUrl = ""
        asset.DeedNo = ""
        asset.SaleOrder = $(cols[1]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"")
        asset.CaseNumber = $(cols[2]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"")
        asset.PropertyType = $(cols[3]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"")
        asset.Rai = $(cols[4]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"")
        asset.Ngan = $(cols[5]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"")
        asset.Wah = $(cols[6]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"")
        asset.CostEstimate = $(cols[7]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"").trim()
        asset.SubDistrict = $(cols[8]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"").trim()
        asset.District = $(cols[9]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"").trim()
        asset.Province = $(cols[10]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"").trim()

        data.push(asset)
      })

      res.status(200)
      res.send({
        total_records: total_records,
        page: page,
        total_page: total_page,
        request_url: request_url,
        status: 'success',
        response: {
          'length': data.length,
          'data': data
        }
      })

    } else {
      res.status(404)
      res.send({
        status: 'failure',
        request_url: request_url,
        response: 'Service is unavailable, Please try again later.',
      })
    }
  })
})

server.get('/detail', (req, res) => {
  const query = req.query
  let law_suit_no = query.law_suit_no
  let law_suit_year = query.law_suit_year
  let Law_Court_ID = query.Law_Court_ID
  let deed_no = query.deed_no
  let addrno = query.addrno

  let request_query = "http://asset.led.go.th/newbid/asset_open.asp?law_suit_no=" + law_suit_no +
                      '&law_suit_year=' + law_suit_year +
                      '&Law_Court_ID=' + Law_Court_ID +
                      '&deed_no=' + deed_no +
                      '&addrno=' + addrno


  var option = {
    uri: request_query,
    encoding: null,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36',
        'Referrer': "..."
    }
  }

  request(option, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var utf8String = iconv.decode(new Buffer(body), "TIS-620");
      const $ = cheerio.load(utf8String)
      let finds = $('div.card-text').toArray()
      let imgs = $('img').toArray()

      let data = {}

      data.DeedNo = $(finds[5]).text().replace(/\n/g,"").replace(/\t/g,"").replace(/\r/g,"").replace(/ /g,"").replace("ที่ดิน","")
      data.img =  'http://asset.led.go.th' + $(imgs[3]).attr('src').trim()
      res.status(200)
      res.send({
        request_url: request_query,
        status: 'success',
        response: {
          'data': data
        }
      })

    } else {
      res.status(404)
      res.send({
        status: 'failure',
        request_url: request_query,
        response: 'Service is unavailable, Please try again later.',
      })
    }
  })
})

server.get('*', (req, res) => {
  res.status(404)
  res.send({
    status: 'failure',
    response: 'route not found.',
  })
})

server.listen(port, () => console.log('Server running at port %d.', port))