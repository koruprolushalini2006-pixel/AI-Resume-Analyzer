const levels = { info: 'INFO', warn: 'WARN', error: 'ERROR' };

const log = (level, message) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${levels[level]}] ${message}`;
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
};

module.exports = {
  info: (message) => log('info', message),
  warn: (message) => log('warn', message),
  error: (message) => log('error', message),
  requestLogger: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      log('info', `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  },
};
