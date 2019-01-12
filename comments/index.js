const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validateUser = require('../middleware/validateUser');

const { comments, create, remove, upvote } = require('./routes');

// router.use(auth);
// router.use(validateUser);
router.get(comments.path, comments.logic);
router.get(upvote.path, upvote.logic);

router.post(create.path, create.logic);

router.delete(remove.path, remove.logic);

module.exports = router;
