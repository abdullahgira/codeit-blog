module.exports = (err, req, res, next) => {
  if (err.status !== 404) console.log(`error: ${err.message}`);
  console.trace(`error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message, data: '' });
};
