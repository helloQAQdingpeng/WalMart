var express = require('express');
var router = express.Router();
var models = require('../../models');
var Sequelize = require('Sequelize');
const Op = Sequelize.Op;

//分类首页接口
router.get('/', function (req, res, next) {
    models.Category.findAll({order: [['sort', 'DESC']]}).then(categories => {
        res.json({categories: categories});
    })

    // res.json(req.user);  //#打印用户信息
});

//分类单条
router.get('/:id', function (req, res, next) {
    let id = req.params.id;
    models.Category.findByPk(id).then(Category => {
        res.json({Category: Category})
    })
});

//分类新增
router.post('/', function (req, res, next) {
    //res.json(req.body)
    var reg =/^([^0][0-9]+|0)$/;
    if (req.body.name == ""){
        return res.json({success: false,msg:"请填写分类名称"})
    }
    if (!reg.test(req.body.sort) && req.body.sort == ""){
        return res.json({success: false,msg:"排序必须是整数"})
    }
    models.Category.create(req.body).then((Category) => {
        res.json({Category: Category})
    });
});

//分类编辑
router.put('/:id', function (req, res, next) {
    var reg =/^([^0][0-9]+|0)$/;
    if (req.body.name == ""){
        return res.json({success: false,msg:"请填写分类名称"})
    }
    if (reg.test(req.body.sort) && req.body.sort == ""){
        return res.json({success: false,msg:"排序必须是整数"})
    }
    models.Category.findByPk(req.params.id).then(Category => {
        Category.update(req.body);
        res.json({Category: Category})
    })
});

//分类删除
router.delete('/:id', function (req, res, next) {
    models.Category.findByPk(req.params.id).then(Category => {
        Category.destroy();
        res.json({msg:'删除成功'})
    })
});

//批量删除
router.post('/delete_checked',function (req,res,next) {
    let checked_ids = req.body.checked_id;
    // res.json(checked_ids);
    // checked_ids.split(',')
    models.Category.destroy({
        where:{
            id:{
                [Op.in]: checked_ids,
            }
        }
    }).then(category => {
        res.json({msg:'删除成功'})
    })
})

module.exports = router;