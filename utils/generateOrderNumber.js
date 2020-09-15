function generateOrderNumber(username, numOrders) {
  let orderNum = numOrders + 1;
  return `${username}${orderNum}`;
}

module.exports = generateOrderNumber;
