const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema ({
    texte : {
        type : String,
        required: true
    },
    auteur : {
        type: String,
        required : true
    }
});

module.exports = mongoose.model('Citation', citationSchema);