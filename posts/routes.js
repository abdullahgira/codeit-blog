const { pick } = require('lodash');
const { Post, validate } = require('./model');
const { User } = require('../users/model');
const { b64Encode, del } = require('../utils');

// for debuging
exports.userPosts = {
  path: '/:username',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const result = [];
    for (post of user.posts)
      result.push({
        id: post.id,
        title: post.title,
        img: post.img
      });
    res.json(result);
  }
};

exports.posts = {
  path: '/',
  logic: async (req, res) => {
    // return all posts in reversely oredered by publish date
    const posts = await Post.find().sort({ date: -1 });

    const result = [];
    for (post of posts)
      result.push({
        id: post.id,
        title: post.title,
        username: post.user.username,
        name: post.user.name,
        img: post.img,
        likes: post.likes,
        comments: post.comments.length
      });
    res.json(result);
  }
};

exports.create = {
  path: '/:username',
  logic: async (req, res) => {
    // return posts for a specific user
    const user = await User.findOne({ username: req.params.username });

    const { error } = validate(req.body);
    if (error) {
      console.log({ error: error.details[0].message });
      return res.status(406).json({ error: error.details[0].message });
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        img: user.img
      }
    });

    if (req.file || req.body.imgFile) {
      post.imgFile = req.file ? b64Encode(req.file.path) : req.body.imgFile || '';
      post.img = `${req.protocol}://${req.get('host')}/api/posts/${req.params.username}/${
        post.id
      }/public/img/${Date.now()}`;
      del('./public/');
    }

    user.posts.unshift({
      _id: post._id,
      title: post.title,
      img: post.img
    });

    for (follower of user.followers.users) {
      const user_follower = await User.findOne({ username: follower.username });
      user_follower.notifications.unshift({
        title: 'New Post',
        body: `${user.username} has created a new post`,
        ispost: true,
        postID: post._id,
        username: user.username,
        img: user.img,
        date: Date.now()
      });
      await user_follower.save();
    }
    await post.save();
    await user.save();

    res.json({ title: post.title, img: post.img });
  }
};

exports.post = {
  path: '/:username/:id/:visitingUser',
  logic: async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(406).json({ status: 406, message: 'there is no post with this ID' });

    const visitingUser = await User.findOne({ username: req.params.visitingUser });
    let isliked = false;
    const result = visitingUser.likes.posts.find(e => e.id === post.id);
    if (result) isliked = true;

    res.json({
      id: post.id,
      name: post.user.name,
      username: post.user.username,
      userImg: post.user.img,
      img: post.img,
      title: post.title,
      created: post.date.toDateString(),
      content: post.content,
      likes: post.likes.number,
      comments: post.comments,
      isliked
    });
  }
};

exports.remove = {
  path: '/:username/:id',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(406).json({ status: 406, message: 'Invalid post ID' });

    const userPosts = user.posts.id(post.id);
    post.remove();
    userPosts.remove();

    await post.save();
    await user.save();
    res.json({ status: 200, message: `Removed post ${post.title}` });
  }
};

exports.like = {
  path: '/:username/like/:id/',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(406).json({ status: 406, message: 'Invalid post ID' });

    const postOwner = await User.findOne({ username: post.user.username });
    postOwner.notifications.unshift({
      title: 'New Like',
      body: `Your post ${post.title} got one more like from @${user.username}`,
      isuser: true,
      name: user.name,
      username: user.username,
      img: user.img,
      date: Date.now()
    });

    post.likes.users.unshift({
      _id: user._id,
      name: user.name,
      username: user.username,
      img: user.img
    });

    user.likes.posts.unshift({
      _id: post.id,
      title: post.title,
      img: post.img,
      username: post.user.username
    });

    post.likes.number = post.likes.users.length.toString();
    user.likes.number = user.likes.posts.length.toString();

    await post.save();
    await user.save();
    await postOwner.save();
    res.json({
      status: 200,
      message: `${post.title} +1 like`,
      number: post.likes.number
    });
  }
};

exports.unlike = {
  path: '/:username/unlike/:id/',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(406).json({ status: 406, message: 'Invalid post ID' });

    const postidx = user.likes.posts.findIndex(e => e._id == post.id);
    const useridx = post.likes.users.findIndex(e => e._id == user._id);

    user.likes.posts.splice(postidx, 1);
    post.likes.users.splice(useridx, 1);

    post.likes.number = post.likes.users.length.toString();
    user.likes.number = user.likes.posts.length.toString();

    await post.save();
    await user.save();
    res.json({
      status: 200,
      message: `${post.title} -1 like`,
      number: post.likes.number
    });
  }
};

exports.postLikes = {
  path: '/:id/likes',
  logic: async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.json(post.likes.users);
  }
};

// exports.bookmark = {
//   path: '/:username/:id/bookmark',
//   logic: async (req, res) => {
//     const user = await User.findOne({ username: req.params.username });
//     const post = await Post.findById(req.params.id);

//     user.bookmarks.number = (Number(user.bookmarks.number) + 1).toString();
//     user.bookmarks.posts.unshift({ id: post.id, title: post.title });

//     await user.save();
//     res.json({ status: 200, message: `${post.title} added to ${user.name} bookmarks` });
//   }
// };

exports.public = {
  path: '/:username/:id/public/img/:creationDate',
  logic: async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(406).json({ status: 406, message: 'Invalid post ID' });

    // if (`${req.protocol}://${req.get('host')}${req.originalUrl}` === post.img) {
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(post.imgFile, 'base64'));
    // } else {
    //   console.log({ status: '404', message: 'Error not found' });
    //   res.status(404).json({ status: '404', message: 'Error not found' });
    // }
  }
};
