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
}  
