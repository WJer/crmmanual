/**
 * @desc  抓取所有图片的url,支持多级目录结构
 */

const fs = require('fs');
const path = require('path');
const SRC = './source';

let urls = '';

//是否markdown文档
function isMarkdown(name) {
	return /\.md/.test(name)
}

//是否是文件夹
function isDirectory(dir) {
	var stat = fs.statSync(dir);
	return stat.isDirectory();
}

//获取url
function getImgUrl(content) {
	var result = '';
	content.replace(/http.*\/(.*?)\.(png|jpg)/g, function(val) {
		result += decodeURI(val);
		result += '\n';
	});
	return result;
}

//抓取所有图片
function readDirectoryImg(dir) {
	fs.readdirSync(dir).forEach(function(item) {
		var item = path.join(dir, item);
		if(isDirectory(item)) {
			readDirectoryImg(item);
		}
		if(isMarkdown(item)) {
			var content = fs.readFileSync(item, 'utf-8');
			var imgurl = getImgUrl(content);
			urls += imgurl;
		}
	});
}


readDirectoryImg(SRC);
if(urls.length > 0) {
	fs.writeFileSync('urls.text', urls);
}
