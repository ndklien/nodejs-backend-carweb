'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const postSchema = new Schema({
    // postId: {
    //     type: Number,
    //     required: true, 
    // },
    title: { type: String, 
        required: true,
        maxlength: 255, 
        },
    slug: {
        type: String,
        slug: "title",
        unique: true, 
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    // Địa chỉ liên hệ
    contactProvince: {
        type: String,
        required: true,
    },
    contactDistrict: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: String,
        required: true
    },
    postContent: {
        type: String,
    },
    postPics: [{
        data: Buffer,
        type: String,
        // required: true,
    }],
    // Xe nhập khẩu hay nội địa
    carType: {
        type: String,
    },
    carBrand: {
        type: String,
        required: true,
    },
    // Dòng xe gì
    carModel: {
        type: String,
    },
    carSeats: {
        type: Number,
    },
    carColor: {
        type: String,
    },
    carFuelType: {
        type: String,
    },
    carOdometer: {
        type: Number,
        required: true,
    },
    // Năm sản xuất
    carYear: {
        type: Number,
    },
    carPrice: {
        type: Number,
        required: true,
    }, 
}, 
{
    timestamps: true, toJSON: { virtuals: true }
}
);

module.exports = mongoose.model('Post', postSchema);