const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Please check the submitted form values.',
      details: err.issues,
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'A record with the same unique value already exists.',
    });
  }

  return res.status(statusCode).json({
    message: err.message || 'Unexpected server error.',
    details: err.details || undefined,
  });
};

module.exports = errorHandler;
