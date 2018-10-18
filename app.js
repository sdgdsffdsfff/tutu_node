// /**
//  * create by wang 2018/9/11
//  * 应用程序入口文件
//  */
 // 加载express模块
var express = require('express');
// 定义模板引擎，用swig.renderFile解析后缀为html的文件
var swig = require('swig');
// var path = require('path');
// 加载数据库模块
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
// 加载body-parser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
var config = require('./config');
var jwt = require('jsonwebtoken'); // 使用jwt签名

// console.log(__dirname);

var app = express();
var User = require("./models/User");
var accessRouter = ['/adimin/','/api/user/register','/api/user/login','/api/user/upload'];
// var port = process.env.PORT || 8088
app.use(bodyParser.json());

app.use(cookieParser()); 

app.all('*',function(req,res,next){                       
    res.header('Access-Control-Allow-Origin','*');  
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");                           
    res.header('Access-Control-Allow-Methods', "GET,POST,DELETE,PUT,OPTIONS,HEAD,FETCH"); 
    // res.header("Access-control-max-age", 10000);
    res.header("Content-Type", "application/json;charset=utf-8"); 
    // res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});//超文本                      res.header('X-Powered-By','3.2.1');                        res.header('Content-Type','application/json;charset=utf-8');                        
    next();               
    });

//设置cookie
// app.use( function(req, res, next) {   
//     // req.cookies = new cookieParser(req, res);
//     console.log(req.userInfo);

//     //解析登录用户的cookie信息
//     req.userInfo = {};
//     // console.log(req.cookies.get('userInfo'));
//     if(req.cookies.userInfo){
//         try{
//             req.userInfo = JSON.parse(req.cookies.userInfo);
//             // 获取当前用户登录的类型是否为管理员
//             User.findById(req.userInfo._id).then(function(userInfo){
//                 req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
//                 next();
//             })
//         }catch(e){
//             next();
//         }
//     }else{
//         next();
//     }
// } );



// 静态文件托管
// 当用户访问的url以/public开始，那么直接对应————dirname + '/public'
// 将所有的静态资源文件都托管到public文件夹里。后续操作中如果需要调用public中的图片什么的， 
// 无论你在哪个文件夹，都把自己当成是在public文件夹即可。 
app.use('/public',  express.static(__dirname + '/public'));
// __dirname项目根目录 ???下面这个方法有问题
// app.use(express.static(path.join(__dirname, 'public')));
// console.log((__dirname + '/public'));
// 

// app.use(cookieParser());
//设置swig页面不缓存
swig.setDefaults({
  cache: false
});
app.set('view cache', false);
//定义当前所应用的模板引擎zz
app.set('views','./views');
// 设置模板引擎存放的目录
app.set('view engine','html');
// 注册所使用模板引擎
app.engine('html', swig.renderFile);
// 设置superSecret 全局参数
app.set('superSecret', config.jwtsecret); 

app.use(bodyParser.urlencoded({extended:true}));

//验证token
app.use( function(req, res, next) {
    // console.log(req.body.token);
    console.log(1111111111111111111111111111111);
    console.log(req.path);
    if(accessRouter.indexOf(req.path) != -1){
        console.log(222222222222222222222222222222222222);
        next();
    }else{
        // console.log(req.body);
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        console.log(token);
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
            }
    });
//     // req.cookies = new cookieParser(req, res);
//     console.log(req.userInfo);

//     //解析登录用户的cookie信息
//     req.userInfo = {};
//     // console.log(req.cookies.get('userInfo'));
//     if(req.cookies.userInfo){
//         try{
//             req.userInfo = JSON.parse(req.cookies.userInfo);
//             // 获取当前用户登录的类型是否为管理员
//             User.findById(req.userInfo._id).then(function(userInfo){
//                 req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
//                 next();
//             })
//         }catch(e){
//             next();
//         }
//     }else{
//         next();
//     }
// } );

//
//    


// 划分不同的功能的模块，加载路由
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));
console.log(config.database+1111);
mongoose.connect(config.database,function(err){
    if(err){
        console.log("失败data connect failed");
    }
    else{
        console.log("成功data connect successfunl");
        console.log(config.network.port+'  22222');
        app.listen(config.network.port);
        console.log('server is started at http://127.0.0.1:'+config.network.port);
    }
});
