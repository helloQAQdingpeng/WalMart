var express = require('express');
var router = express.Router();
var models = require('../../models');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');


// **********************************


//登录接口
router.post('/login', function (req, res, next) {
    var username = req.body.username
    var password = req.body.password

    if (!username || !password) {
        res.json({success: false, message: '用户名或密码错误！'})
        return;
    }

    models.User.findOne({
        where: {
            username: username,
        }
    }).then(user => {
        if (!user) {
            res.json({success: false, message: '用户名不存在！'})
            return;
        }

        if(!bcrypt.compareSync(password, user.password)){
            res.json({success: false, message: '密码错误！'})
            return;
        }

        var token = jwt.sign({
            user:{
                id: user.id,
                username: username,
                admin: true
            }
        }, process.env.SECRET, {expiresIn: 60 * 60 * 24 * 7});

        res.json({
            success: true,
            message: '请求成功',
            token: token
        })
    })
});
//注册
router.post('/register', function (req, res, next) {
    var username = req.body.username
    var password = req.body.password
    var check_password = req.body.check_password

    if (!username || !password) {
        res.json({success: false, message: '用户名或密码必填！'})
        return;
    }

    if(check_password != password){
        res.json({success: false, message: '两次密码输入不一致！'})
        return;
    }
    models.User.findOne({
        where: {
            username: username,
        }
    }).then(user => {
        if (user) {
            res.json({success: false, message: '用户名已注册！'})
            return;
        }

        password = bcrypt.hashSync(password, 8);
        // res.json({password: password})
        models.User.create({
            username: username,
            password: password,
        }).then((user) => {
            res.json({
                success: true,
                message: '请求成功',
                user: user,
                username:username,
            })
        });
    })
});

module.exports = router