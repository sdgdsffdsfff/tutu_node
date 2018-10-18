
var mongoose = require('mongoose');
module.exports = new mongoose.Schema({ 
        //用户头像           
        portrait:{
              type:String,
              default:''  
        },
        //昵称
        nickname:
        {
                type:String,
                default:'',
                require:true  
          },
        //个人描述
        introduction:
        {
                type:String,
                default:'', 
          },
          //上传图片数量
        uploadNum:
        {
                type:Number,
                default:'0', 
          },
          //粉丝数
        startNum:
        {
                type:Number,
                default:'0', 
          },
          //购买数量
        buyNum:
        {
                type:Number,
                default:'0', 
          }
});

