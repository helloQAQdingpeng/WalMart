var express = require('express');
var router = express.Router();
var qiniu = require('qiniu');

router.get('/uploadToken',function (req,res,next) {
    var accessKey = 'vj-Y74U-tIedL39pWjDHAV9uz7v22wZG0EGoRDQU';
    var secretKey = 'UyBy8TN0kHlFQpTbA4cQ4qGAGrSscuL44ySbfG93';
    var mac = new qiniu.auth.digest.Mac(accessKey,secretKey);

    var options = {
        scope:"hollepeng",
    };

    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    res.json({success: true,data:{token:uploadToken}})
})

module.exports = router;