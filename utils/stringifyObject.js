function stringifyObject(obj) {
  let stringOutput = "";
  for (key in obj) {
    if (typeof obj[key] === "object") {
      for (k in obj[key]) {
        stringOutput += `${k} : ${obj[key][k]} \n`;
      }
    } else {
      stringOutput += `${key} : ${obj[key]}\n`;
    }
  }
  return stringOutput;
}

module.exports = stringifyObject;
