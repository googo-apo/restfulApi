const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports. signup = (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    console.log(req.body)
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
            console.log("error---------------",err.code)
            if(err.code === 11000){
                res.status(423).json({duplicate:true})
            }
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next();
        });
}

exports.signin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log("login!", req.body)
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
    console.log("getUserList")
    User.find({}).then(users=>{
        res.json(users)
    })
}

exports.editUserById = (req, res, next) => {
    const email = req.params.id;
    console.log("editting-------------", email, req.body)
    User.findOne({email}).then(user=>{
        console.log(user)
        if(user){
            user.email = req.body.email
            user.name = req.body.name
            user.status = req.body.status
            user.save((err)=>{
                // console.log("editing save  ",err)
                if(err) return res.status(500).json({err: "err occured!"})
                else return res.json(user)
            })
        }
        else{
            res.json({err:"user is not exist!"})
        }
    })
    // next()
}

exports.delUserById = (req, res, next) => {
    const email = req.params.id;
    console.log("delete", req.params)
    User.findOneAndDelete({email:email}).then((user)=>{
        console.log(user)
        if(user === null){
            res.json({err: "user is not exist!"})
        }
        res.json(user)
    })
}