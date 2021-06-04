'use strict';
const Joi = require('joi');

const registerValidator = (data) => {
    const rule = Joi.object({
        fullname: Joi.string() .min(6) .max(255) .required(),
        email: Joi.string() .min(6) .max(255) .required() .email(),
        password: Joi.string() .pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')),
    });

    return rule.validate(data);
}

module.exports.registerValidator = registerValidator;

const createPostValidator = (data) => {
    const rule = Joi.object({
        title: Joi.string() .max(255) .required(),
        contactProvince: Joi.string() .required(),
        contactDistrict: Joi.string() .required(),
        contactPhone: Joi.string() .min(10) .max(10) .required(),
        carBrand: Joi.string() .required(),
        carOdometer: Joi.number() .required(),
        carPrice: Joi.number() .required(),
    });
    
    return rule.validate(data);
}