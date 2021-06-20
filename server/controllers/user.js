const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports. signup = (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then(password => {
        const user = new User({
            email,
            password,
            name
        });
        return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.signin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;    
    User
        .findOne({email: email})
        .then((user) => {
            if (!user) {
                const error = new Error('No user with that email exists');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            console.log(loadedUser);
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong Password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email, 
                    userId: loadedUser._id.toString()
                }, 
                process.env.SECRET||"my secret!", 
                {expiresIn: '1h'}
            );
            res
                .status(200)
                .json({
                    token: token,
                    userId: loadedUser._id.toString()
                    
                });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getUserLists = (req, res, next) => {
    User.find({}).then(users=>console.log(users))
    next()
}

exports.editUserById = (req, res, next) => {
    const email = req.body.email;
    User.findOne({email: email}).then(users=>console.log(users))
    next()
}

exports.delUserById = (req, res, next) => {
    const email = req.body.email;
    User.findOne({email: email}).then(users=>console.log(users))
}