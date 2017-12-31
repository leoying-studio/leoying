var express = require('express');
var router = express.Router();
var ArticleDetailControll = require("./../controlls/article_detail");
// var Article = require("./../models/article");

router.post("/submit", ArticleDetailControll.submit);

router.get("/view/:navId/:categoryId/:articleId/:currentPage", ArticleDetailControll.get);

router.post("/submit_comment", ArticleDetailControll.submitComment);

router.post("/update", ArticleDetailControll.update);

router.post("/del", ArticleDetailControll.del);

module.exports = router;