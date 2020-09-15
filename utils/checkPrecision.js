function checkPrecision(num, precision) {
  let parsed = Number.parseFloat(num);
  return parsed.toPrecision().length <= precision;
}

module.exports = checkPrecision;
