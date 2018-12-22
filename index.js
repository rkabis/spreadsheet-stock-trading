
var PositionRowStart = 17;

function _request(path, params) {
  var headers = {
    "APCA-API-KEY-ID": "APCA-API-KEY-ID",
    "APCA-API-SECRET-KEY": "APCA-API-SECRET-KEY",
  };
  
  var endpoint = "https://paper-api.alpaca.markets";
  var options = {
    "headers": headers,
  };
  var url = endpoint + path;
  if (params) {
    if (params.qs) {
      var kv = [];
      for (var k in params.qs) {
        kv.push(k + "=" + encodeURIComponent(params.qs[k]));
      }
      url += "?" + kv.join("&");
      delete params.qs
    }
    for (var k in params) {
      options[k] = params[k];
    }
  }

  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

function getAccount() {
  return _request("/v1/account");
}

function listOrders() {
  return _request("/v1/orders");
}

function listPositions() {
  return _request("/v1/positions");
}

function submitOrder(symbol, qty, side, type, tif, limit, stop) {
  var payload = {
    symbol: symbol,
    side: side,
    qty: qty,
    type: type,
    time_in_force: tif,
  };
  if (limit) {
    payload.limit = limit;
  }
  if (stop) {
    payload.stop = stop;
  }
  return _request("/v1/orders", {
    method: "POST",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

function orderFromSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.getRange("L2").setValue("submitting")
  
  var side = sheet.getRange("K8").getValue()
  var symbol = sheet.getRange("K9").getValue()
  var qty = sheet.getRange("K10").getValue()
  var type = sheet.getRange("K11").getValue()
  var tif = sheet.getRange("K12").getValue()
  var limit = sheet.getRange("K13").getValue()
  var stop = sheet.getRange("K14").getValue()
  
  var resp = submitOrder(symbol, qty, side, type, tif, limit, stop);
  sheet.getRange("L2").setValue(JSON.stringify(resp, null, 2))
}

function clearPositions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var rowIdx = PositionRowStart;
  while (true) {
    var symbol = sheet.getRange("A" + rowIdx).getValue();
    if (!symbol) {
      break;
    }
    rowIdx++;
  }
  var rows = rowIdx - PositionRowStart;
  if (rows > 0) {
    sheet.deleteRows(PositionRowStart, rows);
  }
}

function updateSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var resp = getAccount()
  
  sheet.getRange("B9").setValue(resp.id)
  sheet.getRange("B10").setValue(resp.buying_power)
  sheet.getRange("B11").setValue(resp.cash)
  sheet.getRange("B12").setValue(resp.portfolio_value)
  sheet.getRange("B13").setValue(resp.status)
  
  sheet.getRange("B10:B12").setNumberFormat("$#,##0.00")

  clearPositions();
  var resp = listPositions()
  
  if (resp.length > 0) {
    resp.sort(function(a, b) { return a.symbol < b.symbol ? -1 : 1 });
    for (var i = 0; i < resp.length; i++) {
      var rowIdx = PositionRowStart + i;
      sheet.getRange("A" + rowIdx).setValue(resp[i].symbol);
      sheet.getRange("B" + rowIdx).setValue(resp[i].qty);
      sheet.getRange("C" + rowIdx).setValue(resp[i].market_value);
      sheet.getRange("D" + rowIdx).setValue(resp[i].cost_basis);
      sheet.getRange("E" + rowIdx).setValue(resp[i].unrealized_pl);
      sheet.getRange("F" + rowIdx).setValue(resp[i].unrealized_plpc);
      sheet.getRange("G" + rowIdx).setValue(resp[i].current_price);
    }
    var endIdx = PositionRowStart + resp.length - 1;
    sheet.getRange("B" + PositionRowStart + ":B" + endIdx).setNumberFormat("#,###");
    sheet.getRange("C" + PositionRowStart + ":C" + endIdx).setNumberFormat("$#,##0.00");
    sheet.getRange("D" + PositionRowStart + ":D" + endIdx).setNumberFormat("$#,##0.00");
    sheet.getRange("E" + PositionRowStart + ":E" + endIdx).setNumberFormat("$#,##0.00");
    sheet.getRange("F" + PositionRowStart + ":F" + endIdx).setNumberFormat("0.00%");
    sheet.getRange("G" + PositionRowStart + ":G" + endIdx).setNumberFormat("$#,##0.00");

    sheet.getRange("C" + (endIdx + 1)).setValue("total")
    sheet.getRange("D" + (endIdx + 1)).setValue("total")
    sheet.getRange("E" + (endIdx + 1)).setValue("total")
    sheet.getRange("F" + (endIdx + 1)).setValue("average")
    sheet.getRange("G" + (endIdx + 1)).setValue("median")
    
    sheet.getRange("C" + (endIdx + 2)).setFormula("=sum(C" + PositionRowStart + ":C" + endIdx + ")")
    sheet.getRange("D" + (endIdx + 2)).setFormula("=sum(D" + PositionRowStart + ":D" + endIdx + ")")
    sheet.getRange("E" + (endIdx + 2)).setFormula("=sum(E" + PositionRowStart + ":E" + endIdx + ")")
    sheet.getRange("F" + (endIdx + 2)).setFormula("=average(F" + PositionRowStart + ":F" + endIdx + ")")
    sheet.getRange("G" + (endIdx + 2)).setFormula("=median(G" + PositionRowStart + ":G" + endIdx + ")")
  }
}