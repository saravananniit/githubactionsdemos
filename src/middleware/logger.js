/**
 * Request logger middleware
 */
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log response when it finishes
  res.on('finish', () => {
    const statusCode = res.statusCode;
    console.log(
      `[${timestamp}] ${method} ${url} - Status: ${statusCode} - IP: ${ip}`
    );
  });

  next();
};

module.exports = logger;
