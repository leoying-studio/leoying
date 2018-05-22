var ArticleModel = require("./../models/article");
var CommentModel = require("./../models/comment");
// var formateData = function(collections) {
// 	if (collections.length === 0) {
// 		return collections;
// 	}
// 	var articles = collections.map(function(doc, index) {
// 		var createdTime = doc.createdTime;
// 		var date = new Date(createdTime);
// 		var year = date.getFullYear();
// 		var month = date.getMonth() + 1;
// 		doc.year = year;
// 		doc.month = month;
// 		return doc;         
// 	});
// 	var timelines = [{
// 		year: collections[0].year,
// 		month: collections[0].month,
// 		events: []
// 	}];
// 	collections.forEach(function(doc, index) {
// 		timelines.forEach(function(line, idx) {
// 			if (line.year == doc.year && line.month == doc.month) {
// 				line.events.push(doc);
// 			} else {
// 				var exist = timelines.some(function(timeline) {
// 					return timeline.year == doc.year && timeline.month == doc.month;
// 				});
// 				if (!exist) {
// 					timelines.push({
// 						year: doc.year,
// 						month: doc.month,
// 						events: [doc]
// 					});
// 				}
// 			}	
// 		});	
// 	});
// 	return timelines;
// }

exports.list = function(conditions , currentPage, callback) {
	var articles = ArticleModel.findPaging({currentPage}, conditions );
	var navs =  ArticleModel.getNavs();
	var count = ArticleModel.count(conditions);
	Promise.all([navs, articles, count])
	.then(function(collections) {
		callback({
			navs: collections[0],
			articles: collections[1],
			total: collections[2]
		});
	}).catch(function(err) {
		callback(err);
	});
}

exports.getTimeline = function(params = {currentPage: 1, pageSize: 12}, conditions = {}) {
	var that = this, pageSize = pageSize || 12;
	return new Promise(function(resolve, rejcet) {
		ArticleModel.count({}, function(err, count) {
			if (err) {
				return rejcet(err);
			}
			var query = {};
			if (conditions.year && conditions.month) {
				var query = {
					'createdAt': {
						$gt: new Date(conditions.year, conditions.month), 
						$lt: new Date(endYear, endMonth)
					}
				};
			}
			// 聚合分组查询
			ArticleModel.aggregate([
				{
					$project: {
						year: {$substr: ['$createdAt', 0, 4]},
						month: {$substr: ['$createdAt', 5, 2]},
						years: {$substr: ['$createdAt', 0, 7]},
						description: '$description',
						img: '$img',
						articleId: '$_id'
					}
				},	
				{
					$match: query
				},
				{
					$group: {
						'_id': '$years',
						number: {$sum: 1},
						document: {$push: {'description': '$description', 'img': '$img', 'articleId':'$articleId'}},
					}
				},
				{
					$limit: pageSize
				}
			]).then(function(collections) {
				resolve({
					count: count,
					list: collections
				});
			});
		}).catch(function(err) {
			rejcet(err);
		});
	});
}

exports.detail =  function(conditions, currentPage, callback) {
	var detail = ArticleModel.findOne({_id: conditions.articleId});
	var comments = CommentModel.findPaging({currentPage}, conditions);
	var total = CommentModel.count(conditions);	
	Promise.all([detail, comments, total]).then(function(collections) {
		if (collections[1].length) {
			collections[1] = collections[1].map(function(item) {
				var diff = (new Date() - new Date(item.createdAt)) / 1000 / 60;
				var diffStr = "";
				if (diff < 1) {
					diffStr = "刚刚";
				} else if(diff < 60) {
					diffStr = parseInt(diff) + '分钟前';
				} else if (diff > 60 && diff < 24 * 60) {
					diffStr = parseInt(diff / 60) + '小时前';
				} else if (diff >= 24 * 60 && diff < 24 * 60 * 7) {
					diffStr = parseInt(diff / 24 / 60) + '天前';
				} else {
					diffStr = item.createdTime
				}
				return {
					username: item.username,
					content: item.content,
					timeDiff: diffStr
				};
			});
		}
		callback({
			detail: collections[0] || {},
			comments: {
				list: collections[1],
				total: collections[2]
			}
		});
	}).catch(function(err) {
		callback(err);
	}); 
}
