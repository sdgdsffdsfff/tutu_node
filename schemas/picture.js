var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    //图片地址
    imgurl:
    {
       type:String,
       default:'',
       required:false
    },
    //名称
    title:
    {
        type:String,
        default:'美图',
        required:false
     },
     //作者
    author:
    {
        ref:'users',
        type: Schema.Types.ObjectId
     },
     //分类
    classify:
    {
        type:String,
        default:'生活',
        required:false
     },
      //点赞数
    goodNum:
    {
        type:Number,
        default:0,
        required:false
     },
     //描述
    description:
    {
        type:String,
        default: '',
        required:false
     },
     //大小
    size:
    {
        type:Number,
        default:0,
        required:false
     },
//图片格式
    imgType:
    {
        type:String,
        default:'',
        required:false
     },
     //标签
    tag:
    {
        type:String,
        default:'',
        required:false
     },
     //上传时间
    createTime:
    {
        type: Date,
        default: new Date(),
        required:false
     },
     //是否免费
    isFree:
    {
        type:Boolean,
        default:true,
        required:false
     },
     //价格
    price:
    {
        type:Number,
        default:0,
        required:false
     },

//下载量
    loadNum: {
        type: Number,
        default: 0,
        require:false
    }
});

    // //关联字段 - 内容分类的id
    // category: {
    //     //类型
    //     type: mongoose.Schema.Types.ObjectId,
    //     //引用
    //     ref: 'Category'
    // },
    // user: {
    //     //类型
    //     type: mongoose.Schema.Types.ObjectId,
    //     //引用
    //     ref: 'User'
    // },

  