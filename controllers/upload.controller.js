// 'use strict';

// // Models call
// const Post = require('../models/post.model');

// // Upload file configuration
// // const util = require('util');
// // const fs = require('fs');

// const { uploadFilesMiddleware } = require('../middlewares/s3');

// // const unlinkFile = util.promisify(fs.unlink);

// exports.uploadImages = async (req, res) => {
//     try {
//         const filesUploaded = await uploadFilesMiddleware(req, res);
        

//         if (req.files.length <= 0) return res.send({ message: "You haven't selected any files" });

//         else {
//             const postID = req.params.postID;
//             const post = await Post.findById(postID);
            
//             if (!post) return res.status(404).send({ message: "Cannot find Post with id " + postID });

//             post.postPics = post.postPics.concat({ filesUploaded });

//             await post.save(post);
//             return res.send({ message: "Files have been uploaded" });
//         }
//     } catch (err) {
//         return res.send({ message: err.message || "Failed to upload files" });
//     };
// }

// // Upload images to s3 and Post model
// // exports.uploadImages = async (req, res) => {
// //     const postID = req.params.postID;

// //     const post = await Post.findById(postID);

// //     if (!post) return res.status(400).send({ message: "Cannot find Post with id " + postID });

// //     const files = req.files;
// //     for (let i=0 ; i < files.length ; i++) {
// //         const result = await uploadFile(files[i]);
// //         await unlinkFile(files[i].path);
// //         var imagePath = `api/images/${result.Key}`;
// //         post.postPics = post.postPics.concat({ imagePath });
// //     }

// //     try {
// //         await post.save(post);
// //         console.log(post);
// //         return res.send("Ok!");
// //     } catch (err) {
// //         return res.status(400).send({ message: err.message || "Failed to upload image to post " + postID });
// //     }

// // };

// // exports.getImages = (req, res) => {
// //     const postId = req.params.postId;
// //     const imgId = req.params.imgKey;
// //     const postReq = Post.findById(postId);
// //     if (!postReq) return res.status(404).send({ message: "Cannot find Post with id " + postId});

// //     try {
// //         const imgReq = Post.findOne({ _id: postId, postPics: imgId });
// //         if (!imgReq) return res.status(404).send({ message: "Cannot find Image with id " + imgId });
// //         const readStream = getFileStream(imgId);
// //         readStream.pipe(res);
// //     } catch (err) {
// //         return res.status(400).send({ message: err.message || "Failed to get image from S3 bucket"});
// //     }
// // }

// // exports.getImages = (req, res) => {
// //     const key = req.params.imgKey;
// //     const readStream = getFileStream(key);
    
// //     readStream.pipe(res);
// // };
