const { GoogleSpreadsheet } = require("google-spreadsheet");
const dotenv = require("dotenv");
dotenv.config();

const coffeeSheetIndex = 0;
const skippedHeaders = ["Roast Recs"]; // can't display due to space constraints

// Count occurrences of undefined
function countUndefined(arr) {
  return arr.reduce((acc, current) => {
    if (current === undefined) acc++;
    return acc;
  }, 0);
}

// Turn undefined into unicode space
function formatUndefinedVals(obj) {
  const copy = obj;
  for (const val in copy) {
    if (copy[val] === undefined) copy[val] = "\u200B";
  }
  return copy;
}

// Turn spreadsheet data into array of objects for display
function formatRows(rows) {
  return rows.reduce((acc, current) => {
    const { headerValues } = current._sheet;
    const obj = {};

    // Skip value if needed
    headerValues.forEach((header) => {
      if (!skippedHeaders.includes(header)) obj[header] = current[header];
    });
    const multipleUndefined = countUndefined(Object.values(obj)) > 1;

    // If a row has more than one undefined, skip it
    if (!multipleUndefined) {
      const cleaned = formatUndefinedVals(obj);
      if (acc.length === 0) return [cleaned];
      return [...acc, cleaned];
    }
    return [...acc];
  }, []);
}

async function getSpreadsheetData() {
  const doc = new GoogleSpreadsheet(process.env.COFFEE_SHEET_ID);
  doc.useApiKey(process.env.SHEETS_API_KEY);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[coffeeSheetIndex];
  const rows = await sheet.getRows();
  return formatRows(rows);
}

module.exports = getSpreadsheetData;
