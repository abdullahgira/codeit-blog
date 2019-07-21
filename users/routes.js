const bcrypt = require('bcrypt');
const { pick } = require('lodash');

const { Post } = require('../posts/model');
const { User, validate, validateLogin, validateUpdate } = require('./model');
const { img, b64Encode, binarySearch, del, sort } = require('../utils');

function getUsername(obj, user) {
  return binarySearch(obj.users, 0, obj.number, user, 'username');
}

const filter = ['name', 'username', 'email', 'img'];

// TODO:
// 5- Get bookmarks number
// 6- Change the .sort() method with the custom built util.mergesort()

exports.register = {
  path: '/register',
  logic: async (req, res) => {
    // Checking for duplicater email or username
    const foundUsername = await User.findOne({ username: req.body.username });
    const foundEmail = await User.findOne({ email: req.body.email });
    if (foundUsername) {
      return res.status(400).json({ error: 'username is already registered' });
    }

    if (foundEmail) {
      return res.status(400).json({ error: 'email is already registered' });
    }

    // Validating req.body content
    const { error } = validate(req.body);
    if (error) return res.status(406).json({ error: error.details[0].message });

    const user = new User(pick(req.body, [...filter, 'password']));

    // Setting default image
    user.imgFile = img;
    user.img = `${req.protocol}://${req.get('host')}/api/users/${user.username}/public/img/${Date.now()}`;

    // Encrypting password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    res.json(pick(user, filter));
  }
};

exports.profile = {
  path: '/:username/profile',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    const followers = user.followers.number,
      following = user.following.number,
      likes = user.likes.number,
      // bookmarks = user.bookmarks.number,
      posts = user.posts.length.toString();

    res.json({ followers, following, likes, posts, img: user.img });
  }
};

exports.home = {
  path: '/:username/home',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    const result = [];
    for (following of user.following.users) {
      const user_following = await User.findOne({ username: following.username });
      for (post of user_following.posts) {
        const user_post = await Post.findById(post.id);
        result.push({
          id: user_post.id,
          username: user_post.user.username,
          name: user_post.user.name,
          title: user_post.title,
          img: user_post.img,
          likes: user_post.likes.number,
          comments: user_post.comments.length,
          date: user_post.date
        });
      }
    }
    result.sort((a, b) => b.date - a.date);
    res.json(result);
  }
};

exports.login = {
  path: '/login',
  logic: async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(404).json({ error: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email.trim() });
    if (!user) {
      return res.status(400).json({ error: 'invalid email or password' });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'invalid email or password' });
    }

    // const token = user.generateAuthToken();
    response = pick(user, filter);
    response['token'] = user.generateAuthToken();
    res.json(response);
  }
};

exports.update = {
  path: '/:username/update/',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    const { error } = validateUpdate(req.body);
    if (error) return res.status(406).json({ status: 406, message: error.details[0].message });

    if (req.file || req.body.imgFile) {
      user.imgFile = req.file ? b64Encode(req.file.path) : req.body.imgFile || '';
      user.img = `${req.protocol}://${req.get('host')}/api/users/${user.username}/public/img/${Date.now()}`;
      del('./public/');
    }

    for (let propery in req.body) {
      user[propery] = req.body[propery];
      if (propery === 'username')
        user.img = `${req.protocol}://${req.get('host')}/api/users/${user.username}/public/img/${Date.now()}`;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await user.save();
    res.json(pick(user, filter));
  }
};

exports.follow = {
  path: '/:username/follow/:username2',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const user2 = await User.findOne({ username: req.params.username2 });

    if (!user || !user2) {
      return res.status(406).json({
        status: 406,
        message: `there is no user with this username ${req.params.username} || ${req.params.username2}`
      });
    }

    // if (user.username != req.user.username)
    //   return res.status(406).json({ status: 403, message: `Access denied` });

    // Extra secure layer
    const following = getUsername(user.following, user2.username);
    if (following !== -1) {
      return res.status(404).json({ error: `${user.username} is already following ${user2.username}` });
    }

    // Update followers and following for the proper user
    let u2idx = user.followers.users.findIndex(u => u.username === user2.username);
    if (u2idx !== -1) user.followers.users[u2idx].isfollowing = true;

    user.following.users.unshift({
      name: user2.name,
      username: user2.username,
      img: user2.img
    });

    let isfollowing = false;
    if (user2.following.users.findIndex(u => u.username === user.username) !== -1) isfollowing = true;

    user2.followers.users.unshift({
      name: user.name,
      username: user.username,
      img: user.img,
      isfollowing: isfollowing
    });

    user.following.number = (Number(user.following.number) + 1).toString();
    user2.followers.number = (Number(user2.followers.number) + 1).toString();

    user.following.users.sort((a, b) => {
      if (a.username < b.username) return -1;
      if (a.username > b.username) return 1;
      return 0;
    });

    user2.following.users.sort((a, b) => {
      if (a.username < b.username) return -1;
      if (a.username > b.username) return 1;
      return 0;
    });

    user2.notifications.unshift({
      title: 'New follower',
      body: `@${user.username} started fowllowing you`,
      isuser: true,
      name: user.name,
      username: user.username,
      img: user.img,
      date: Date.now()
    });

    await user.save();
    await user2.save();
    res.json({
      status: 200,
      message: `@${user.username} started following ${user2.username}`,
      followers: user2.followers.number
    });
  }
};

exports.unfollow = {
  // Search username is user1.following.users using binary search
  path: '/:username/unfollow/:username2',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const user2 = await User.findOne({ username: req.params.username2 });

    if (!user || !user2)
      return res.status(406).json({
        status: 406,
        message: `there is no user with this username ${req.params.username} || ${req.params.username2}`
      });

    const removeFromFollowers = getUsername(user2.followers, user.username);
    if (removeFromFollowers === -1) {
      return res.status(404).json({ msg: `${user.username} is not following ${user2.username}` });
    } else {
      user2.followers.users.splice(removeFromFollowers, 1);
    }

    const removeFromFollowing = getUsername(user.following, user2.username);
    if (removeFromFollowing === -1)
      return res.status(404).json({ msg: `${user.username} is not following ${user2.username}` });
    else {
      user.following.users.splice(removeFromFollowing, 1);
    }

    user.following.number = (Number(user.following.number) > 0
      ? Number(user.following.number) - 1
      : 0
    ).toString();

    user2.followers.number = (Number(user2.followers.number) > 0
      ? Number(user2.followers.number) - 1
      : 0
    ).toString();

    let u2idx = user.followers.users.findIndex(u => u.username === user2.username);
    if (u2idx !== -1) user.followers.users[u2idx].isfollowing = false;

    await user.save();
    await user2.save();
    res.json({
      status: 200,
      message: `${user.username} unfollowed ${user2.username}`,
      followers: user2.followers.number
    });
  }
};

exports.isFollowing = {
  path: '/:username/isfollowing/:username2',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const user2 = await User.findOne({ username: req.params.username2 });

    if (!user || !user2)
      return res.status(406).json({
        status: 406,
        message: `there is no user with this username ${req.params.username} || ${req.params.username2}`
      });

    const following = getUsername(user.following, user2.username);
    if (following === -1) return res.json({ isfollowing: false });
    else return res.json({ isfollowing: true });
  }
};

exports.followers = {
  path: '/:username/followers',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.json(user.followers.users);
  }
};

exports.following = {
  path: '/:username/following',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    res.json(user.following.users);
  }
};

exports.likes = {
  path: '/:username/likes',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    const result = [];
    for (p of user.likes.posts) {
      const post = await Post.findById(p._id);
      result.push({
        id: post.id,
        username: post.user.username,
        title: p.title,
        img: p.img,
        comments: post.comments.length,
        likes: post.likes.number
      });
    }
    res.json(result);
  }
};

exports.notifications = {
  path: '/:username/notifications',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    // const notifications = user.notifications.map(n => pick(n, ['title', 'body', 'img']));
    res.json(user.notifications);
  }
};

exports.clearNotifications = {
  path: '/:username/notifications',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    user.notifications = [];
    await user.save();
    res.json({
      status: 200,
      message: `@${user.username} notifications cleared`
    });
  }
};

// exports.bookmarks = {
//   path: '/:username/bookmarks',
//   logic: async (req, res) => {}
// };

// Public
exports.public = {
  path: '/:username/public/img/:creationDate',
  logic: async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    // if (`${req.protocol}://${req.get('host')}${req.originalUrl}` === user.img) {
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(user.imgFile, 'base64'));
    // } else res.status(404).json({ status: '404', message: 'Error not found' });
  }
};
