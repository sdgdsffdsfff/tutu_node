var mongoose = require('mongoose');
module.exports = new mongoose.Schema({ 
        //订单号
        orderNum:
        {
            type:Number,
            require:true
        },
        //买家
        cumtomer:
        {
            type:String,
            require:true
        },
        //联系方式
        telephone:
        {
            type:Number,
            require:true
        },
        //创建时间
        buyTime:{
            type: Date,
            default: new Date(),
            required:true
        },
        //总价
        totalPrice:
        {         
            type:Number,
            require:true
        },
        //购买数量
        goodsNum:
        {         
            type:Number,
            require:true
        }
});

