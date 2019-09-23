var express = require('express');
var router = express.Router();
var models = require('../models');


// 扫码加入购物车接口,前端传商品条形码code
router.post('/', function (req, res, next) {
    var code = req.body.code;
    // res.json(code);return
    models.Product.findOne({
        where: {
            code: code,
        }
    }).then(product => {
        // res.json(product);return;
        if (!product) {
            res.json({success: false, message: '此商品不存在！'})
            return;
        }
        models.Cart.findOrCreate({
            where: {
                productId: product.id,
                userId: req.decoded.user.id,
            },
            defaults: {
                number: 1,
                userId: req.decoded.user.id,
                productId: product.id
            }
        }).spread((cart, created) => {   // spread 把数组转换成对象，方便下面的取值
            // res.json(!created);return;
            if (!created) {   //如果为fasle，则说明carts表里面已经有了该商品，只需增加它的数量
                models.Cart.findOne({where: {id: cart.id}}).then(cart => {
                    cart.increment('number');
                    res.json({success: true, message: '添加成功'})
                })
            }
            res.json({success: true, message: '添加购物车成功', data: cart})
        })

    })
});
// 购物车首页,关联查出当前用户的商品信息
router.get('/', function (req, res, next) {
    models.Cart.findAll({
        include: [
            models.Product,
        ],
        where: {userId: req.decoded.user.id}
    }).then(cart => {
        // console.log(cart)
        let total_price = 0;
        let number = 0;
        cart.map(item => {
            total_price += item.number * item.Product.price;
            number += item.number;
        });

        res.json({
            success: true, message: '查询成功',
            data: cart,
            total: total_price,
            number: number,
        })
    })
});


// 购物车数量加减，前端传增减type和购物车的id
router.put('/', function (req, res, next) {
    let type = req.body.type;
    let cart_id = req.body.cart_id;

    models.Cart.findByPk(cart_id).then(cart => {
        if (type === 'inc') {
            cart.increment('number')
            return res.json({success: true, message: '修改成功'})
        }

        if (cart.number > 1) {
            cart.decrement('number')
            return res.json({success: true, message: '修改成功'})
        }

        cart.destroy()
        res.json({success: true, message: '清除成功'})
    })
});

module.exports = router;