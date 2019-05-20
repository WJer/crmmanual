/**
 * @desc 目录结构排平
 */
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn

const SRC = './src';
const FROM = './source';

//是否markdown文档
function isMarkdown(name) {
	return /\.md/.test(name)
}

//是否是文件夹
function isDirectory(dir) {
	var stat = fs.statSync(dir);
	return stat.isDirectory();
}


function copyMarkdowns(dir) {
	fs.readdirSync(dir).forEach(function(item) {
		var item = path.join(dir, item);
		if(isDirectory(item)) {
			copyMarkdowns(item);
		}
		if(isMarkdown(item)) {
			var filename = item.split('/')[item.split('/').length-1];
			var content = fs.readFileSync(item, 'utf-8');
			fs.writeFileSync(path.join(SRC, filename), content);
		}
	});
}

//启动
function start() {
	fs.mkdirSync(SRC);
	copyMarkdowns(FROM);
}

let childObject = spawn('rm', ['-rf', 'src']);

childObject.on('close', ()=>{
	start();
});
