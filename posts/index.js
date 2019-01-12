const express = require('express');
const router = express.Router();

const { Post } = require('./model');
const upload = require('../middleware/multer');
// const auth = require('../middleware/auth');
// const validateUser = require('../middleware/validateUser');
// const sameUser = require('../mimeUser');

const {
  userPosts,
  post,
  posts,
  create,
  remove,
  public,
  like,
  unlike,
  postLikes
  // bookmark
} = require('./routes');

router.get(posts.path, posts.logic);

// router.use(auth);
// router.use(validateUser);

// Like & Bookmark
router.get(like.path, like.logic);
router.get(unlike.path, unlike.logic);
router.get(postLikes.path, postLikes.logic);

// Public
router.get(public.path, public.logic);

router.get(userPosts.path, userPosts.logic);
router.get(post.path, post.logic);

// router.post(create.path, [sameUser, upload.single('imgFile')], create.logic);
router.post(create.path, upload.single('imgFile'), create.logic);
router.delete(remove.path, remove.logic);

router.delete('/', async (req, res) => {
  await Post.deleteMany({});
  res.json({ msg: 'Done' });
});

module.exports = router;
