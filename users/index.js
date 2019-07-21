const express = require('express');
const router = express.Router();
const { pick } = require('lodash');

const { User } = require('./model');
const upload = require('../middleware/multer');
// const auth = require('../middleware/auth');
// const validateUser = require('../middleware/validateUser');
// const sameUser = require('../middleware/sameUser');

const {
  register,
  login,
  update,
  follow,
  followers,
  following,
  unfollow,
  isFollowing,
  likes,
  profile,
  public,
  notifications,
  clearNotifications,
  home
  // bookmarks
} = require('./routes');

// TODO:
// Edit profile
// bookmarks

// Authentication: Sign-up and login
router.post(register.path, register.logic);
router.post(login.path, login.logic);

router.get('/', async (req, res) => {
  const users = await User.find().sort({ date: -1 });
  const result = users.map(user => pick(user, ['username', 'name', 'email', 'img.url']));
  res.json({ error: '', data: result });
});

// Calling auth with it's validator middleware
// router.use(auth);
// router.use(validateUser);

// Public
router.get(public.path, public.logic);

// Update Profile
// router.put(update.path, [sameUser, upload.single('imgFile')], update.logic);
router.put(update.path, upload.single('imgFile'), update.logic);

// Profile
router.get(profile.path, profile.logic);
// Home
router.get(home.path, home.logic);

router.get(notifications.path, notifications.logic);
router.delete(clearNotifications.path, clearNotifications.logic);

// Follow, unfollow, followers and following
router.get(follow.path, follow.logic);
router.get(unfollow.path, unfollow.logic);
router.get(followers.path, followers.logic);
router.get(following.path, following.logic);
router.get(isFollowing.path, isFollowing.logic);

// Likes & Bookmarks
router.get(likes.path, likes.logic);
// router.get(bookmarks.path, bookmarks.logic);

// Test route
router.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.json({ name: user.name, img: user.img });
});

// router.delete('/', async (req, res) => {
//   await User.deleteMany({});
//   res.json({ msg: 'Done' });
// });

module.exports = router;
