var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('./../models/config');
var Model = require('./../models/model');

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password || typeof (username) !== 'string' || typeof (password) !== 'string')
        return res.json({ success: false, message: 'Incorrect Credentials Format' });
    else {
        username = username.toLowerCase();
        Model.User.findOne({ username: username }).exec()
            .then(function (user) {
                if (!user)
                    res.json({ success: false, message: 'User Authentication Failed' });
                else {
                    return Model.validatePassword(password, user.password)
                        .then(function (isMatch) {
                            if (!isMatch)
                                res.json({ success: false, message: 'User Authentication Failed' });
                            else {
                                var token = jwt.sign(user, config.secret, {
                                    expiresIn: '7d'
                                });
                                res.json({ success: true, token: token });
                            }
                        });
                }
            })
            .catch(function (err) {
                if (err)
                    res.json({
                        success: false,
                        message: 'Something happened at our end. Please try after sometime.'
                    });
            });
    }
});

router.post('/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password || typeof (username) !== 'string' || typeof (password) !== 'string')
        return res.json({ success: false, message: 'Incorrect Credentials Format' });
    else {
        username = username.toLowerCase();
        Model.User.findOne({ username: username }).exec()
            .then(function (user) {
                if (user)
                    res.json({
                        success: false,
                        message: 'User is already registered. Please select another username.'
                    });
                else {
                    return Model.createHash(password);
                }
            })
            .then(function (hash) {
                return Model.User({
                    username: username,
                    password: hash
                });
            })
            .then(function (averageJoe) {
                return averageJoe.save()
                    .then(function () {
                        res.json({
                            success: true,
                            message: 'User registration successfull'
                        });
                    });
            })
            .catch(function (err) {
                if (err)
                    res.json({
                        success: false,
                        message: 'Something happened at our end. Please try after sometime.'
                    });
            });
    }
});

module.exports = router;
