var express = require('express');
var router = express.Router();
var models = require('../models');
var request = require('request');
var jwt = require('jsonwebtoken');

//小程序登录接口，前端传code过来，最终要获取前端用户登录的token。微信开发者打开小程序，找到app.js的wx.login方法，里面console.log(res.code)，然后通过postman把code传过来做接口测试
router.post('/login', function (req, res, next) {
  // console.log(req.query)
  var code = req.body.code
  request.get({
    uri: 'https://api.weixin.qq.com/sns/jscode2session',
    json: true,
    qs: {
      grant_type: 'authorization_code',
      appid: 'wx4a9965771e11b4bd',
      secret: 'e94f1c12cb09e31bff0f12826f945b60',
      js_code: code
    }
  }, async (err, response, data) => {
    // res.json(data.openid);return;
    if (response.statusCode != 200) {
      return res.json(err)
    }

    let user = await models.User.findOne({
      where: {openid: data.openid}
    })

    if (!user) {
      user = await models.User.create({openid: data.openid, admin: 0})
    }

    var token = jwt.sign({
      user: {
        id: user.id,
        openid: data.openid,
        admin: false
      },
    }, process.env.SECRET, {expiresIn: 60 * 60 * 24 * 7});
    res.json({success: true, message: '登录成功', token: token})
  })
})

module.exports = router;