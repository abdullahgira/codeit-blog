const bodyParser = require('body-parser');

// Load routes
const users = require('../users');
const posts = require('../posts');
const comments = require('../comments');
const search = require('../search');

// Load middlewares
const logrequests = require('../middleware/logrequests');
const error = require('../middleware/error');
const auth = require('../middleware/auth');

module.exports = app => {
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.use(logrequests);
  app.use('/api/users', users);

  // auth is used after users because users have /register route which desn't
  // yet have json web token
  // app.use(auth);
  app.use('/api/posts', posts);
  app.use('/api/comments', comments);
  app.use('/api/search', search);

  app.use((req, res, next) => {
    const error = new Error('404 not found');
    error.status = 404;
    next(error);
  });
  app.use(error);
};
