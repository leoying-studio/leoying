const Comments = require('./../models/comments');

exports.list = function(articleId, pagination) {
	return Comments.queryPaging( { pagination}, {articleId});
}

exports.add = function(field) {
	return Comments.create(field);
}

exports.destory = function(id) {
	return Comments.findByIdAndRemove(id).exec();
}

exports.count = function(articleId) {
	return Comments.count({articleId}).exec();
}