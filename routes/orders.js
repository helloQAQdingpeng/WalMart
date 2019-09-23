var express = require('express');
var router = express.Router();
var models = require('../models');
const tenpay = require('tenpay'); 


// 结算即下单接口，点击结算需往orders表和order_products表插入数据
router.post('/', async function (req, res, next) {
    let user_id = req.decoded.user.id
    // 查询该用户购物车的商品
    let carts = await models.Cart.findAll({include: [models.Product], where: {userId: user_id}})

    if (carts.length == 0) {
        return res.json({success: false, message: '请添加商品在提交订单'})
    }

    let num = new Date().getTime() + Math.floor(Math.random() * 100) + user_id; //生成随机订单号
    let order = await models.Order.create({out_trade_no: num, status: 1, userId: user_id})

    let Order_product = carts.map(item => {
        return {
            productId: item.productId,
            number: item.number,
            orderId: order.id
        }
    })
    await models.Order_product.bulkCreate(Order_product)

    // 删除购物车表
    // await models.Cart.destroy({
    // where: {userId: user_id}
    // });

    res.json({
        success: true,
        message: '请求成功',
        orderId: order.id
    })
})

// 我的订单接口，根据前端传过来的订单id去查出当前用户的订单和商品信息
router.get('/', function(req, res, next) {
    var id = req.query.id;
    // res.json(id);return;

    models.Order.findOne({
        include: {
            model: models.Order_product,
            include: [{
                model: models.Product,
            }]
        }, where: {id: id}
    }).then(order => {
        let total = 0;
        order.Order_products.forEach(item => {
            total += item.number * parseFloat(item.Product.price)
        })

        res.json({success: true, message: '请求成功', order, total})
    })
});

// 微信支付接口，前端需传订单号
router.post('/pay', async function (req, res, next) {
    let out_trade_no = req.body.out_trade_no

    // 根据订单号去查当前订单
    let order = await models.Order.findOne({
        where: {
            out_trade_no: out_trade_no
        }
    });

    //获取总价
    let Order_products = await models.Order_product.findAll({
        where: {
            orderId: order.id
        },
        include: [models.Product],
    });

    let total = 0;
    Order_products.forEach(item => {
        total += parseFloat(item.Product.price) * item.number
    })

    const config = {
        appid: 'wx4a9965771e11b4bd', //公众号ID
        mchid: '1230390602', //微信商户号
        partnerKey: 'phpwh56fgdhdghjtyeq3luiughjfeft3', //微信支付安全密钥
        notify_url: 'http://localhost:3000/notify', //支付回调网址
    };
    const api = new tenpay(config, true);
    //获取微信JSSDK支付参数
    let result = await api.getPayParams({
        out_trade_no: out_trade_no,  //商户内部订单号
        body: '沃尔玛商城', //商品简单描述
        total_fee: total * 100, //订单金额(分)
        openid: req.decoded.user.openid  //付款用户的openid
    });
    res.json(result)
})
module.exports = router;