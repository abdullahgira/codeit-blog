const express = require('express');
const app = express();
require('express-async-errors');

const error = require('./middleware/error');

require('./startup/db')();
app.use(express.static('static'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

require('./startup/routes')(app);
app.use((req, res, next) => {
  const error = new Error('404 not found');
  error.status = 404;
  next(error);
});
app.use(error);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listining on port ${port}`));
