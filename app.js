const express = require('express')
const app = express()
const port = 3000

require('dotenv').config()
const fetch = require('node-fetch');

app.listen(port, () => requestStock('aapl'))

const requestStock = stock => {
	const stockQuote = fetchStockQuote(stock)
	return stockQuote
}

const fetchStockQuote = async stock => {
	const endpoint = process.env.ENDPOINT
	const options = {
    "method": "GET",
    "muteHttpExceptions": true
  }

  const url = `${endpoint}/stock/${stock}/ohlc`
  const fetchData = await fetch(url, options).then(res => res.json())
  console.log(fetchData)
}