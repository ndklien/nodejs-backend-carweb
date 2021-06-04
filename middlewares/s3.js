'use strict';

const fs = require('fs');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const shortid = require("shortid");

require('dotenv').config();

const accessKeyId = process.env.AWS_SECRET_KEY_ID;
const secretAccessKey = process.env.AWS_KEY;
const region = 'ap-southeast-1';
const bucketName = 'car-thrift-01';

const multer = require('multer');
// const util = require('util');

// const s3 = new S3({
//     region: region,
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey,
// });

const s3 = new aws.S3({
    accessKeyId,
    secretAccessKey
});


exports.uploadS3post = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      region,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      ACL: 'public-read',
      metadata:  (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        var newFileName = shortid.generate() + "-" + file.originalname;
        var fullPath = 'images/post/' + newFileName;
        cb(null, fullPath);
      },
    }),
});

exports.uploadS3news = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        region,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        ACL: 'public-read',
        metadata:  (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          var newFileName = shortid.generate() + "-" + file.originalname;
          var fullPath = 'images/news/' + newFileName;
          cb(null, fullPath);
        },
      }),
});

// ============== Configuration for Multer GridFsStorage

// var storage = new GridFsStorage({
//     url: process.env.ATLAS_URI, 
//     options: { useNewUrlParser: true, useUnifiedTopology: true },
//     file: (req, file) => {
//         const match = ["image/png", "image/jpeg"];

//         if (match.indexOf(file.mimetype) === -1) {
//             const filename = `${Date.now()}-carthrift-${file.originalname}`;
//             return filename;
//         };

//         return {
//             bucketName: "photos", 
//             filename: `${Date.now()}-carthrift-${file.originalname}`,
//         }
//     }
// });

// var uploadFiles = multer({ storage: storage }).array("image", 9);
// exports.uploadFilesMiddleware = util.promisify(uploadFiles);

// exports.getFile = (req, res, next) => {
//     GridFsStorage.find({ filename: req.params.filename }).toArray((err, files) => {
//         if (!files[0] || files.length === 0) {
//             return res.send({})
//         }
//     })
// };