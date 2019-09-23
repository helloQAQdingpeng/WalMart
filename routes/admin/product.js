var express = require('express');
var router = express.Router();
var models = require('../../models');
var Sequelize = require('Sequelize');
const Op = Sequelize.Op;

//商品首页接口
router.get('/', function (req, res, next) {
    //分页
    var currentPage = req.query.currentPage == undefined ? 1 : req.query.currentPage; //判断当前是第几页
    var pageSize = 5;//每页显示几条
    //按名称搜索
    var keyword= req.query.keyword;
    var data = {}; //定义一个空对象
    if(keyword != undefined && keyword != ''){
        data.name = {
            [Op.like]: '%' + keyword + '%'
        }
    }

    //按分类搜索
    var category= req.query.category;
    if(category != undefined && category != ''){
        data.categoryId = {
            [Op.like]:  category
        }
    }


    models.Product.findAndCountAll({
        include:[models.Category],
        where:data,
        order: [['id', 'DESC']],
        offset:(currentPage - 1) * pageSize,
        limit: parseInt(pageSize)
    }).then(resilt => {
        res.json({
            Products: resilt.rows,
            pagination:{
                current:parseInt(currentPage),
                pageSize:parseInt(pageSize),
                total:resilt.count
            }
        });
    })
});

//商品单条
router.get('/:id', function (req, res, next) {
    let id = req.params.id;
    models.Product.findByPk(id).then(Product => {
        res.json({Product: Product})
    })
});

//商品新增
router.post('/', function (req, res, next) {
    models.Product.create(req.body).then((Product) => {
        res.json({Product: Product})
    });
});

//商品编辑
router.put('/:id', function (req, res, next) {
    models.Product.findByPk(req.params.id).then(Product => {
        Product.update(req.body);
        res.json({Product: Product})
    })
});

//商品删除
router.delete('/:id', function (req, res, next) {
    models.Product.findByPk(req.params.id).then(Product => {
        Product.destroy();
        res.json({msg:'删除成功'})
    })
});

//商品批量删除
router.post('/delete_checked',function (req,res,next) {
    let checked_ids = req.body.checked_id;
    // res.json(checked_ids);
    // checked_ids.split(',')
    models.Product.destroy({
        where:{
            id:{
                [Op.in]: checked_ids,
            }
        }
    }).then(Product => {
        res.json({msg:'删除成功'})
    })
})

module.exports = router;