import pkg from "google-spreadsheet";
const { GoogleSpreadsheet } = pkg;
import dotenv from "dotenv";
dotenv.config();

const coffeeSheetIndex = 0;
const headers = ["Origin", "Stock (12 oz bag)", "Tasting Notes"];

function formatRows(headers, rows) {
  return rows.reduce((acc, current) => {
    const obj = {};
    headers.forEach((header) => (obj[header] = current.header));

    if (!acc) return [obj];
    return Object.values(obj).includes(undefined) ? [...acc] : [...acc, obj];
  }, []);
}

export async function getData() {
  const doc = new GoogleSpreadsheet(process.env.COFFEE_SHEET_ID);
  await doc.useApiKey(process.env.SHEETS_API_KEY);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[coffeeSheetIndex];
  const rows = await sheet.getRows();
  return formatRows(headers, rows);
}
