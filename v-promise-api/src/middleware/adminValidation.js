import Joi from "joi";

export const validateUserCreation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().max(100).required(),
        email: Joi.string().email().max(150).required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().max(50).required(),
        branch_id: Joi.number().integer().allow(null),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

export const validateUserUpdate = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().max(100),
        email: Joi.string().email().max(150),
        role: Joi.string().max(50),
        branch_id: Joi.number().integer().allow(null),
    }).min(1);

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

export const validateUserStatus = (req, res, next) => {
    const schema = Joi.object({
        status: Joi.string().valid('ACTIVE', 'INACTIVE', 'BLOCKED').required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

export const validateBranch = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().max(100).required(),
        city: Joi.string().max(100).allow('', null),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

export const validateBranchUpdate = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().max(100),
        city: Joi.string().max(100).allow('', null),
    }).min(1);

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};
