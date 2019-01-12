const { User } = require('../users/model');

module.exports = async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  if (user.username != req.user.username)
    return res.status(406).json({ status: 403, message: `Access denied` });
  next();
};
