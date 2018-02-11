var mongoose=require('../db').mongoose;
var Utils = require("./../utils/index");
var DBSuper = require("./super");
// 定义映射的集合结构模型
var Scheam = new mongoose.Schema({
	 background: String,
	 title: String,  // 标题
	 name: String,  // 专题名称
	 themes: [
		 {img: {type: String}, describe: {type: String}}
	 ],
	 discription: String,
	 serverTime: { type: String, default: Utils.getTime(new Date(), "s")}
});

Scheam.plugin(DBSuper.regNav);

var User = mongoose.model('special ', Scheam);
module.exports = User;