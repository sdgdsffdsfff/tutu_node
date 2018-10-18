var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send("对不起，只有管理员才可以进入后台");
        return;
    }
    next();
});
// 首页
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});
// 用户管理
router.get('/user',function(req,res,next){
    var page = Number(req.query.page || 1);
    var limit = 2;    
    // 从数据库中读取用户数据
    User.count().then(function(count){
        var pages = Math.ceil(count/limit);
        page = Math.min(page,pages);
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        User.find().limit(limit).skip(skip).then(function(users){
            // console.log(users);
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    })     
});



// 分类首页
router.get('/category',function(req,res,next){
    var page = Number(req.query.page || 1);
    var limit = 2;     
    Category.count().then(function(count){
       var  pages = Math.ceil(count/limit);
        page = Math.min(page,pages);
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        // sort id:1 升序
        //  -1 降序
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            console.log(categories);
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    })     
});

// 分类首页展示
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    });
})

// 添加分类保存
router.post('/category/add',function(req,res,next){
    console.log(req.body.name);
    var name = req.body.name || '';
    if(name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        });
    }
//    数据库中是否已存在同名的数据
    Category.findOne({
        name:name
    }).then(function(rs){
        if(rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库中已存在同名数据'
            });
            return Promise.reject();
        }else{
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类保存成功',
            url:'/admin/category'
        });
    });
});


// 添加分类修改
router.get('/category/edit',function(req,res,next){
    var id  = req.query.id || '';    
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库中没有该条数据'
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
});

// 添加分类修改保存
router.post('/category/edit',function(req,res,next){
    var id  = req.query.id || ''; 
    //获取post提交过来的名称
    var name = req.body.name || ''; 
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库中没有该条数据'
            });
            return Promise.reject();
        }else{
            // 当用户没有做任何修改的时候提交数据
            if(name == category.name ){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                //要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
           
        }
    }).then(function(sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类'
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        });
    });
});


// 添加分类删除
router.get('/category/delete',function(req,res,next){
    var id  = req.query.id || '';
    Category.remove(
        {
            _id:id
        }).then(function(){
            res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'删除成功',
                    url: '/admin/category'
                });
        });
});


// 内容首页
router.get('/content',function(req,res,next){
    var page = Number(req.query.page || 1);
    var limit = 10;     
    Content.count().then(function(count){
       var  pages = Math.ceil(count/limit);
        page = Math.min(page,pages);
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        // sort id:1 升序
        //  -1 降序
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        })
        .then(function(contents){
            console.log(contents)
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    })     
});

// 内容添加页面
router.get('/content/add',function(req,res,next){
    Category.find().sort({_id: -1}).then(function(categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    });
})

/*
* 内容保存
* */
router.post('/content/add', function(req, res) {
    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }
    //保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(rs){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        })
    });

});

// 添加内容修改
// router.get('/content/edit',function(req,res,next){
//     var id  = req.query.id || '';
//     var categories = [];
//     Category.find().sort({_id:1}).then(function(rs){
//         console.log(rs+1111)
//         categories:rs;
//         return Content.findOne({
//             _id:id
//         }).populate('category');
//     }).then(function(content){
//         // console.log(content);
//             if(!content){
//                 res.render('admin/error',{
//                     userInfo:req.userInfo,
//                     message:'数据库中没有该条数据'
//                 });
//                 return Promise.reject();
//             }else{
//                 res.render('admin/content_edit',{
//                     userInfo:req.userInfo,
//                     categories: categories,
//                     content:content
//                 });
//             }
//         });
//     });

router.get('/content/edit', function(req, res) {

    var id = req.query.id || '';

    var categories = [];

    Category.find().sort({_id: 1}).then(function(rs) {
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            })
        }
    });

});


// 添加内容修改保存
router.post('/content/edit',function(req,res,next){
    var id = req.query.id || '';
    if(req.body.category == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if( req.body.title == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }
    Content.update({
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content/edit?id=' + id
        });
    });
});


// 添加内容删除
router.get('/content/delete',function(req,res,next){
    var id  = req.query.id || '';
    Content.remove(
        {
            _id:id
        }).then(function(){
            res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'删除成功',
                    url: '/admin/content'
                });
        });
});


module.exports = router;