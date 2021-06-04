'use strict';
const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;
const roleSchema = new Schema({
    name: { type: String }
})

module.exports = mongoose.model('Role', roleSchema);