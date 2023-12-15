const mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
})

exports.Catalog = mongoose.model("Catalog", catalogSchema);
