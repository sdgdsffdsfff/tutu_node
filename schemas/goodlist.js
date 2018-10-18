var mongoose = require('mongoose');
module.exports = new mongoose.Schema({
            // 单条商品id
                goodid:{
                    type:Number,
                    require:true
                },
            //商品名称
                goods:
                {
                    type:String,
                    require:true
                },
                //商家
                merchant:
                {
                    type:String,
                    require:true
                },
                //价格	
                price:
                {
                    type:Number,
                    require:true
                },
                //是否选中
                isChecked:
                {
                    type:Boolean,
                    require:true
                }               
    });