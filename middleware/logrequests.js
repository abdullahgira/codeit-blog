const util = require('util');

module.exports = (req, res, next) => {
  console.log(`{
  url: ${req.url},
  headers: ${util.inspect(req.headers, false, null, true)},
  method: ${req.method}
}`);
  next();
};
