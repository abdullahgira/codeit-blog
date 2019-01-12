const { Comment, validate } = require('./model');
const { User } = require('../users/model');
const { Post } = require('../posts/model');

exports.comments = {
  path: '/:username/:id/',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ status: 404, message: 'Invalid post id' });
    const response = [];

    post.comments.reverse();
    for (comment of post.comments) {
      const user_comment = await User.findOne({ username: comment.username });
      response.push({
        id: comment.id,
        name: user_comment.name,
        username: user_comment.username,
        img: user_comment.img,
        body: comment.body,
        upvotes: comment.upvotes,
        date: comment.date.toDateString()
      });
    }

    res.json(response);
  }
};

exports.create = {
  path: '/:username/:id/',
  logic: async (req, res) => {
    console.log('Blabla');
    const user = await User.findOne({ username: req.params.username });
    const post = await Post.findById(req.params.id);

    console.log(req.body);
    // Validation
    if (!post) return res.status(406).json({ status: 406, message: 'Invalid post id' });
    const req_username = await User.findOne({ username: req.body.username });
    if (!req_username)
      return res
        .status(406)
        .json({ status: 406, message: 'There is no user with this `username`' });

    const { error } = validate(req.body);
    if (error) {
      console.log({ error: error.details[0].message });
      return res.status(406).json({ error: error.details[0].message });
    }

    const comment = new Comment({
      username: req.body.username,
      body: req.body.body
    });

    user.notifications.unshift({
      title: 'You have a new comment',
      body: `${req.body.username} has commented on your post ${post.title}`,
      ispost: true,
      postID: post.id,
      usernmae: user.username,
      img: req.body.img,
      date: Date.now()
    });

    // Notifying mentioned users
    // const match = comment.body.match(/@[a-z]+/g);
    // for (username of match) {
    //   const mentioned_user = await User.findOne({
    //     username: username.split('@')[1].trim()
    //   });
    //   if (!mentioned_user)
    //     return res
    //       .status(406)
    //       .json({ status: 406, message: 'There is no user with this `username`' });
    //   mentioned_user.notifications.unshift({
    //     title: `You have a new mention`,
    //     body: `You have been mentioned in ${req.body.username} comment`,
    //     ispost: true,
    //     postID: post.id,
    //     usernmae: user.username,
    //     date: Date.now()
    //   });
    //   if (mentioned_user.username !== user.username) await mentioned_user.save();
    // }

    post.comments.unshift(comment);
    await post.save();
    res.json({ status: 200, message: `${post.title} +1 comment` });
  }
};

exports.remove = {
  path: '/:username/:post/:comment',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const userPost = user.posts.id(req.params.post);

    if (!userPost)
      return res.status(406).json({ status: 406, message: 'Invalid post id' });

    if (!user)
      return res.status(406).json({
        status: 406,
        message: `there is no user with this username ${req.params.username}`
      });

    const post = Post.findById(userPost.id);
    const comment = post.comments.id(req.params.comment);
    if (!comment)
      return res.status(406).json({ status: 406, message: 'Invalid post id' });

    comment.remove();
    await user.save();
    res.json({ status: 200, message: 'Comment deleted successfully' });
  }
};

exports.upvote = {
  path: '/:username/:post/:comment/upvote',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const post = user.posts.id(req.params.post);
    const comment = post.comments.id(req.params.comment);

    comment.upvotes = (Number(comment.upvotes) + 1).toString();
    await user.save();
    res.json({ status: 200, message: '+1 UPVOTE' });
  }
};
