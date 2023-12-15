function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        // Unauthorized Error
        res.status(401).json({ message: "The user is not Authorized" });
    }

    if (err.name === 'ValidationError') {
        // Validation Error
        res.status(401).json({ message: err.message });
    }

    // Default Server Error
    res.status(500).send('Internal Server Error');
}

module.exports = errorHandler;
