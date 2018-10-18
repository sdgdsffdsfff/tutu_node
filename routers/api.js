var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Picture = require('../models/Picture');
var Content = require('../models/Content');
var jwt = require('jsonwebtoken'); // 使用jwt签名
var config = require('../config');
var User =require('../models/User');//用户列表
var multer = require('multer');//接收图片
var sd = require("silly-datetime");
const fs = require('fs');


// var qiniu = require("qiniu");
// var qiniuConfig = new qiniu.conf.Config();
//     qiniuConfig.zone = qiniu.zone.Zone_z0;
// var accessKey = 'wXufrO_S5elK1hyQf7kifg1z8Q5r1kfeLo9ZN2CD';
// var secretKey = 'hTMRxoHKQs0GA4-a2ICedziFG-L8ffwK2T3Ibps';
// var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// var options = {
//     scope: 'photo',
//     expires:447200,
//     returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
//     callbackUrl: 'http://api.example.com/qiniu/upload/callback',
//     callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
//     callbackBodyType: 'application/json'
// };
//   var putPolicy = new qiniu.rs.PutPolicy(options);
// //   encodedPutPolicy = urlsafe_base64_encode(putPolicy);
//   var uploadToken=putPolicy.uploadToken(mac);
  


var responseData;
var app = express();

var upload = multer({
    dest: './upload'
});//定义图片上传的临时目录
// var storage = multer.memoryStorage()
// var upload = multer({ storage: storage })

// 设置superSecret 全局参数
app.set('superSecret', config.jwtsecret); 

router.use(function(req,res,next){
    console.log(req.query);
    responseData = {
        code:0,
        message:'请求成功'
    }
    next();
});
router.post('/user/register',function(req,res,next){
    // return res.send({	
    //     status:0,	
    //     info:'读取文件异常'	
    //     });	
    console.log(req.body);
    var username = req.body.username || req.query.username;
    var password = req.body.password || req.query.password;
    var repassword = req.body.repassword || req.query.repassword;
    if(username ==''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return; 
    }
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '密码不一致';
        res.json(responseData);
        return;
    }
    User.findOne({
        username:username
    }).then(function(userInfo){
        // console.log(userInfo);
        if(userInfo){
            responseData.code = 4;
            responseData.message = '用户名已被注册';
            res.json(responseData);
            return;
        }
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function(newUserInfo){
        // console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    });
});

router.post('/user/login',function(req,res,next){
    var username = req.body.username || req.query.username ;
    var password = req.body.password || req.query.password;
    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData); 
    }
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        console.log(123+userInfo);
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户民或密码错误';
            res.json(responseData);
            return;
        }

        responseData.message = '登录成功';
        var token = jwt.sign(userInfo.toJSON(), app.get('superSecret'), {
            expiresIn : 60*60*10// 授权时效24小时
         });
         console.log(token);
        //  var usertoken = new Usertoken({
        //      token:String 
        // }); 
        // usertoken.save();       
        responseData.userInfo = {
            _id:userInfo._id,
            username:userInfo.username,
            message: '请使用您的授权码',
            token:token
        }
        console.log("login sucessful");
        // res.cookie('userInfo',JSON.stringify({
        //     _id:userInfo._id,
        //     username:userInfo.username
        // }));
        console.log(responseData);  
        res.json(responseData); 
         
        return;
    })
});

router.post('/user/autrority',function(req,res,next){
    console.log(req.body);

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {      
        // 解码 token (验证 secret 和检查有效期（exp）)
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
              if (err) {
            return res.json({ success: false, message: '无效的token.' });    
              } else {
                // 如果验证通过，在req中写入解密结果
                req.decoded = decoded;  
                //console.log(decoded);
                next(); //继续下一步路由
          }
        });
      } else {
        // 没有拿到token 返回错误 
        return res.status(403).send({ 
            success: false, 
            message: '没有找到token.' 
        });
      }
    // var username = req.body.username;
    // var password = req.body.password;

    // res.cookie('userInfo', '', {expires: new Date(0)}); 
    responseData.message = 'token 验证成功';    
    res.json(responseData);
});

// 上传图片的中间件

router.post('/user/upload',upload.single('file'),function(req,res,next){
    console.log(req.body.token);
    
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
        
        if(token){
        // 解码 token (验证 secret 和检查有效期（exp）
             jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err){
                    console.log(err);
                    return res.json({ success: false, message: '无效的token.已过期' });    
                }
                 req.decoded = decoded;  
                        next(); //继续下一步路由
                }); 
             }
             else{                
    //     //  // 没有拿到token 返回错误 
                return res.status(403).send({ 
                    success: false, 
                    message: '请重新登录' 
                });
             }
    console.log(req.file);
    console.log(req.file.path);
    console.log(req.body.token);
       // 图片会放在uploads目录并且没有后缀s，需要自己转存，用到fs模块
      // 对临时文件转存，fs.rename(oldPath, newPath,callback);
    var newPath = "./public/upload/" + req.file.originalname;
    console.log(newPath);
        fs.rename(req.file.path,newPath, function(err) {

            console.log('done!');
        });
        // res.send('ok');        
//         //使用第三方模块silly-datetime
     var t = sd.format(new Date(), 'YYYYMMDDHHmmss');
     var reg2 = /([^/]+)$/;
     var pictureType = req.file.mimeType.match(reg2)[1];
     var uid = req.decoded._id;
    //  嵌套多表管理？？？？没处理完成 ref
     console.log(uid);
     var picture = new Picture({
                imgurl:newPath,            
                title:req.body.title,  //名称                              
                athord:uid, // author:uid, //作者       
                classify:req.body.classify,  //分类                
                goodNum:req.body.goodNum ,//点赞数              
                description:req.body.description, //描述
                size:req.file.size,       
                imgType:pictureType,//图片格式       
                tag:req.body.tag,//标签    
                createTime:t,//上传时间        
                isFree:req.body.isFree, //是否免费         
                price:parseFloat(req.body.price),//价格    
                loadNum:req.body.loadNum, //下载量
        });
        picture.save();  
        responseData.code = 0;  
        responseData.message = '上传成功';
        console.log('okkkkk')
        return res.json(responseData);

        // console.log(mac+222);       
        // console.log(uploadToken+111);
    //   var localFile = newPath;
    //   console.log(newPath);
    //  var localFile ='./public/upload/1_2.jpg'
    //  var key = '1_2.jpg'

    //   var formUploader = new qiniu.form_up.FormUploader(config);
    //   var putExtra = new qiniu.form_up.PutExtra();
    // //   var key='123.jpg';
    //   // 文件上传
    //   formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
    //     respBody, respInfo) {
    //     if (respErr) {
    //       throw respErr;
    //     }
    //     if (respInfo.statusCode == 200) {
    //       console.log(respBody);
    //     } else {
    //       console.log(respInfo.statusCode);
    //       console.log(respBody);
    //     }
    // });
 });

// 退出
router.get('/user/logout',function(req,res,next){
     console.log(req.decoded);
     
    res.cookie('userInfo', '', {expires: new Date(0)});     
    res.json(responseData);
});

/*
* 获取指定文章的所有评论
* */
router.get('/comment', function(req, res) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

/*
* 评论提交
* */
router.post('/comment/post', function(req, res) {
    //内容的id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent) {
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});


router.get('/read', function(req, res, next) { 
    // var type = req.param('type') || '';
    // //获取url传递的参数，如果用户没有传默认为空
    //  fs.readFile(PATH + type + '.json', function(err, data){
    // if(err){			
    return res.send({	
        status:0,	
        info:'读取文件异常'	
        });	
        // }	        
        // var COUNT = 50;
        // //返回最多50行数据
        //     var obj = [];	
        //         try{		
        //         obj = JSON.parse(data.toString());
        //         //这里做异常处理，如果文件中存储的不是json格式的字符串（比如空文件）这里会抛出异常	
        //         }catch(e){		
        //                 obj =[];	                                
        //             }		
        //                 if(obj.length > COUNT){	                                   
        //                     obj = obj.slice(0,COUNT);//返回前50行数据 	
        //                     }		return res.send({	
        //                                 status:1,	
        //                                 data:obj	
        //                                 });  
                            });
                        // });
module.exports = router;