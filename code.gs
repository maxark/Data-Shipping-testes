const DB_ID = "1oo4KWOdbcN8JW6LFA7lj6KyYDYXNmaYMJreVzF9B6eQ";

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('DATA SHIPPING Logística - Cloud')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function saveToDB(payloadString) {
  try {
    var ss = SpreadsheetApp.openById(DB_ID);
    var sheet = ss.getSheetByName('V50_DB');
    if (!sheet) {
      sheet = ss.insertSheet('V50_DB');
      sheet.getRange('A1:B1').setValues([['GHOST_PAYLOAD', 'LAST_SYNC']]).setFontWeight('bold');
      sheet.setColumnWidth(1, 600);
    }
    
    var time = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
    
    sheet.getRange('A2').setNumberFormat('@').setValue(payloadString);
    sheet.getRange('B2').setNumberFormat('@').setValue(time);
    
    return time;
  } catch (e) {
    throw new Error("Erro na gravação: " + e.message);
  }
}

function loadFromDB() {
  try {
    var ss = SpreadsheetApp.openById(DB_ID);
    var sheet = ss.getSheetByName('V50_DB');
    if (!sheet) return null;
    
    var payload = sheet.getRange('A2').getDisplayValue();
    var time = sheet.getRange('B2').getDisplayValue();
    
    if (!payload || payload.length < 5) return null;
    return { payload: payload, time: time };
  } catch (e) {
    throw new Error("Erro na leitura: " + e.message);
  }
}
