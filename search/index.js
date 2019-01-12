const express = require('express');
const router = express.Router();

const { Post } = require('../posts/model');
const { User } = require('../users/model');

search = {
  path: '/:q',
  logic: async (req, res) => {
    const posts = await Post.find();
    const users = await User.find();
    const postsResult = []; // [{freq: '', title: '', id: ''}]
    const usersResult = []; // [{freq: '', title: '', id: ''}]
    const searchRegExp = new RegExp(req.params.q, 'ig');

    for (p of posts) {
      const matchContent = p.content.match(searchRegExp);
      const matchTitle = p.title.match(searchRegExp);
      if (matchTitle)
        postsResult.push({
          freq: matchTitle.length + (matchContent ? matchContent.length : 0),
          title: p.title,
          username: p.user.username,
          img: p.img,
          id: p.id
        });
      else if (matchContent)
        postsResult.push({
          freq: matchContent.length,
          title: p.title,
          username: p.user.username,
          img: p.img,
          id: p.id
        });
    }

    for (u of users) {
      const matchContent = u.name.match(searchRegExp);
      if (matchContent)
        usersResult.push({
          freq: matchContent.length,
          name: u.name,
          username: u.username,
          img: u.img
        });
    }

    postsResult.sort((a, b) => b.freq - a.freq);
    usersResult.sort((a, b) => b.freq - a.freq);
    res.json({ posts: postsResult, users: usersResult });
  }
};

router.get(search.path, search.logic);

module.exports = router;
