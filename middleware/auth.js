const auth = (req, res, next) => {
    // Since we're using service account authentication,
    // we don't need to verify user tokens
    next();
};

module.exports = auth; 