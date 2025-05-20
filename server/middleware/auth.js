// Basic auth middleware that allows all requests
// TODO: Implement proper authentication later
const auth = (req, res, next) => {
  // For now, just pass through all requests
  next();
};

module.exports = auth; 