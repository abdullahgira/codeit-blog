const { User } = require('../users/model');

module.exports = async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user)
    return res.status(406).json({
      status: 406,
      message: `there is no user with this username ${req.params.username}`
    });
  next();
};
