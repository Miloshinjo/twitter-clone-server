const express = require('express');
const cors = require('cors');

const app = express();

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
    next(new Error('No username or password', 400));
  }

  res.status(200).json({
    status: 'success',
    data: 'Logged in',
  });
});

// handle unknown requests
app.all('*', (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server`, 404));
});

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
