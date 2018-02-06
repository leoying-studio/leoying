var express = require('express');
var router = express.Router();
var ArticleModel = require("./../models/article");
var NavModel = require("./../models/nav");
var CommentModel = require("./../models/comment");
var Utils = require("./../utils");
var Validator = require("./../utils/validator");
var ArticleProxy = require("./../proxy/article");

// 新增
router.post("/submit", function(req, res) {
	var body = req.body;
	var title = body.title;
	var img = body.img;
	var description = body.description;
	var navId = body.navId;		
	var recommend = body.recommend || false;
	var categoriesId = body["categoriesId"] || [];
	var content = body.content;
	var recommendImg = body.recommendImg || "";
	if (typeof categoriesId == "string") {
		categoriesId = categoriesId.split(",");
	}
	var validate = Validator([
		{mode: "required", value: title, message: "标题不能为空"},
		{mode: "required, len", conditions: {min: 10}, value: content, message: "文章内容不能少于十个字符"},
		{mode: "len", type: Array, message: "请至少选择一个分类", conditions: {min: 1}, value: categoriesId}
	]);
	if (!validate.status) {
		req.flash("error", validate.message);
		return res.redirect("/manager");
	}
	categoriesId = categoriesId.map(function(id) {
		return {id};
	});

	// 开始插入数据
	var fields = {
		title,
		img,
		navId,
		categoriesId,
		description,
		recommend,
		recommendImg,
		content
	};
    new ArticleModel(fields).save(function(err, article) {
		if (!err) {
			 // 插入成功
			req.flash("success", "添加文章列表成功!");
			return res.redirect("/manager");
		}
		req.flash("error", "添加文章列表失败!");
		res.redirect("/manager");
	});
});

// 查询
router.get("/view/:navId/:categoryId/:currentPage",function(req, res)　{
	var params = req.params;
	var navId = params.navId;
	var categoryId = params.categoryId;
	var currentPage = params.currentPage;
	var page = req.query.page;
	var conditions = {
		 navId,
		'categoriesId.id': categoryId,
	};
	ArticleProxy.list(conditions, currentPage, function(data) {
		data.params = {
			navId,
			categoryId,
 			currentPage,
		};
		res.render("article/index", data);
	});
}); 


// ajax查询文章列表
router.get("/data",function(req, res)　{
	var query = req.query;
	var navId = query.navId;
	var categoryId = query.categoryId;
	var currentPage = Number(query.skip);
	var page = req.query.page;
	var conditions = {
		 navId,
		'categoriesId.id': categoryId,
	};
	ArticleProxy.list(conditions, currentPage, function(data) {
		res.send(data);
	});
}); 

// 删除
router.post("/delete", function(req, res) {
	var body = req.body;
	var articleId = body.articleId;

	// 清除关联数据
	Promise.all([
		ArticleModel.remove({_id: articleId}),
		CommentModel.remove({articleId}),
	]).then( values => {
		var state = values.every(function(item) {
			return item.result.ok == 1;
		});
		if (state) {
			res.send({
				status: true,
				message: "success"
			});
		} else {
			res.send({
				status: false,
				message: "删除错误"
			});
		}
	}).catch(e => {
		res.send({
			status: false,
			message: "出现异常"
		});
	});
}); 

// 修改
router.post("/update", function(req, res) {
	var body = req.body;
	var title = body.title;
	var img = body.img;
	var description = body.description;
	var recommend = body.recommend || false;
	var categoriesId = body["categoriesId"] || [];
	var content = body.content;
	var recommendImg = body.recommendImg || "";
	var validate = Validator([
		{mode: "required", value: title, message: "标题不能为空"},
		{mode: "required", value: img, message: "缩略图不能为空"},
		{mode: "required", value: description, message: "文章说明不能为空"},
		{mode: "required, len", value: content, message: "文章内容不能少于十个字", conditions: {min: 10}}
	]);
	if (!validate.status) {
		req.flash("error", validate.message);
		return res.redirect("/manager");
	}

    ArticleModel.update({
		_id:articleId
	}, {
		$set: {
			title,
			description,
			img,
			description,
			recommend,
			categoriesId,
			content,
			recommendImg
		}
	}, function(err , state) {
		if (err) {
			return res.send({
				message: "更新失败",
				status: false
			});
		} 
		if (state.n > 0) {
			res.send({
				message: "更新成功",
				status: true
			});
		}
	});
});

router.get("/detail/view", function(req, res) {
	var body = req.body;
	var articleId = body.articleId;
	var currentPage = body.currentPage;
	ArticleProxy.detail({articleId}, currentPage, function(data) {
		data.params = {
			articleId,
			currentPage
		};
		res.render("detail", data);
	});
});

router.get("/comments", function(req, res) {
	var body = req.body;
	var articleId = body.articleId;
	var currentPage = body.skip;
	CommentModel.findPaging({articleId}, {currentPage}).then(function(collections) {
		res.send(collections);
	});
});	

router.post("/comment/submit", function (req, res) {
	var body = req.body;
	var username = body.username;
	var content = body.content;
	var articleId = body.articleId;
	var validate = Validator([
		{mode: "required", value: username, message: "用户名不能为空"},
		{mode: "required, len", value: content, message: "评论内容不能少于10个字符", conditions: {min: 10}}
	]);
	if (!validate.status) {
		res.flash("error", validate.message);
		return res.redirect("article/detail");
	}
	var fields = {
		username,
		content,
		articleId
	};
	new CommentModel(fields).save(function (err, comment) {
		if (err) {
			return res.send({
				status: false,
				message: "添加失败"
			});
		}
		res.send({
			status: true,
			data: {comment}
		});
	});
});

module.exports = router;