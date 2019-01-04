function _request(path) {  
  var endpoint = "https://api.iextrading.com/1.0";
  var options = {
    "method": "GET",
    "muteHttpExceptions": true
  };
  var url = endpoint + path;
  
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

function getStockQuote(ticker) {
  var tickerData = _request("/stock/" + ticker + "/ohlc")
  return tickerData
}

function handleButtonStockQuote() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var stockQuote = getStockQuote("aapl")
  sheet.getRange("B9").setValue(stockQuote.open.price)
  sheet.getRange("C9").setValue(stockQuote.high)
  sheet.getRange("D9").setValue(stockQuote.low)
  sheet.getRange("E9").setValue(stockQuote.close.price)
}