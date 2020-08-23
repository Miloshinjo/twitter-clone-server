const fs = require('fs');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const globalErrorHandler = require('./errorController');
const AppError = require('./appError');

const app = express();

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/db/users.json`, 'utf-8')
);

const tweets = JSON.parse(
  fs.readFileSync(`${__dirname}/db/tweets.json`, 'utf-8')
);

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down...');
  console.log(err.name, err.message);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

app.use(express.json());
app.use(cors());

app.post('/api/v1/users/login', (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError('No username or password', 400));
  }

  const user = users.find((user) => user.email === req.body.email);

  if (!user) {
    return next(new AppError('Invalid credentials', 400));
  }

  if (req.body.password !== user.password) {
    return next(new AppError('Invalid credentials', 400));
  }

  res.status(200).json({
    status: 'success',
    token: jwt.sign({ id: user.id }, 'mysecret'),
    data: {
      id: user.id,
      email: user.email,
    },
  });
});

app.get('/api/v1/tweets', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: tweets,
  });
});

app.get('/api/v1/tweets/:id', (req, res, next) => {
  if (!req.body.id) {
    return next(new AppError('Missing the tweet id', 400));
  }

  const tweet = tweets.find((tweet) => tweet.id === req.body.id);

  if (!tweet) {
    return next(new AppError('Such tweet doesnt exist', 400));
  }

  res.status(200).json({
    status: 'success',
    data: tweet,
  });
});

// handle unknown requests
app.all('*', (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

const server = app.listen(8080, () => {
  console.log(`App running on port 8080...`);
});

process.on('unhandledRejection', () => {
  console.log('UNHANDLED REJECTION 💥 Shutting down...');
  server.close(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
});

module.exports = app;
