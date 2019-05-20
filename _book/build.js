/**
 * crm产品文档生成手册
 * @author wujing
 */

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const DIR = './_book/';
const SRC = path.join(DIR, 'src');
const GITBOOK = path.join(DIR, 'gitbook');


const REG_MD_IMG_IN = /!\[(.*?)\]\(\s?http:\/\/(.*?)\.(png|jpg)\s?\)/g;
const REG_MD_IMG_OUT = /\[(\d*)\]:\s?http:\/\/(.*?)\.(png|jpg)/g;
const REG_HTML_IMG_SRC = /(\<img.*?)src(.*?\/?\>)/g;
const REG_JS_TIME = /var\se=r\(\),t=e\.scrollTop\(\),n=e\.prop\(\"scrollHeight\"\),o=e\.prop\(\"clientHeight\"\),i=b\.length,l=null;w\(b\.get\(\)\.reverse\(\)\)\.each\(function\(e\)\{var\sn,r=u\(w\(this\)\);r\&\&!l\&\&\(n=a\(r\),t\>=n\&\&\(l=w\(this\)\)\),e!=i-1\|\|l\|\|\(l=w\(this\)\)\}\),l\|\|t\|\|\(l=b\.first\(\)\),t\&\&n-t==o\&\&\(l=b\.last\(\)\),s\(l\)/g;
const REG_JS_ERROR = /var\st=e\.children\(\"a\"\),n=t\.attr\(\"href\"\)\.split\(\"#\"\)\[1\];return\sn\&\&\(n=\"#\"\+n\),n\?n\:\"\"/g;

/**
 * @替换函数生成器
 * @reg          {regexp}  替换的正则匹配
 * @replacement  {string|function}  替换后的值或者生成替换文本的函数
 * @return {function}  生成的替换函数 
 */
function makeReplaceFunction(reg, replacement) {
	return function(content) {
		return content.replace(reg, replacement);
	}
}



const imgUtil = {

	//md文中的图片路径
	replaceImgInContent: (makeReplaceFunction(REG_MD_IMG_IN, (val, $1, $2, $3) => {
		var dirs = $2.split('/');
		var len = dirs.length;
		if(/image\.(png|jpg)/.test(dirs[len-1])) {
			return `![image](images/${dirs[len-2]}.${$3})`;
		}else{
			return `![image](images/${dirs[len-1]}.${$3})`;
		}
	})),

	//md最后引用的图片路径
	replaceImgOutContent: (makeReplaceFunction(REG_MD_IMG_OUT, (val, $1, $2, $3) => {
		var dirs = $2.split('/');
		var len = dirs.length;
		if(/image\.png/.test(val)) {
			return `[${$1}]: images/${dirs[len-2]}.${$3}`;
		}else{
			return `[${$1}]: images/${dirs[len-1]}.${$3}`;
		}
	})),

	//替换src为data-src
	replaceImgSrc: (makeReplaceFunction(REG_HTML_IMG_SRC, (val, $1, $2)=>{
		return `${$1}data-src${$2}`;
	}))

};

const jsUtil = {

	//耗时的部分
	replaceThemejsTime: (makeReplaceFunction(REG_JS_TIME, 'this.I && clearTimeout(this.I);this.I = setTimeout(function(){var e=r(),t=e.scrollTop(),n=e.prop("scrollHeight"),o=e.prop("clientHeight"),i=b.length,l=null;w(b.get().reverse()).each(function(e){var n,r=u(w(this));r&&!l&&(n=a(r),t>=n&&(l=w(this))),e!=i-1||l||(l=w(this))}),l||t||(l=b.first()),t&&n-t==o&&(l=b.last()),s(l)},200);')),

	//报错的部分
	// replaceThemejsError: (makeReplaceFunction(REG_JS_ERROR, 'var t=e.children("a");if(t.length==0){return ""};var\sn=t.attr("href").split("#")[1];return n&&(n="#"+n),n?n:""'))

}

function start() {

	//图片处理
	console.log('info: 替换图片的src属性');
	const mdFiles = fs.readdirSync(DIR+'/src');
	mdFiles.forEach((fname) => {
		if(/\.md/.test(fname)) {
			return;
		}
		let fpath = path.join(SRC, fname);
		if(fs.statSync(fpath).isDirectory()) {
			return;
		}
		let content = fs.readFileSync(fpath, 'utf8');
		content = imgUtil.replaceImgSrc(content);
		fs.writeFileSync(fpath, content);
	});

	//js处理
	console.log('info: 处理好themejs文件');
	const themejsPath = path.join(GITBOOK, 'theme.js'); 
	let themeCon = fs.readFileSync(themejsPath, 'utf8');
	Object.keys(jsUtil).forEach((fn) => {
		jsUtil[fn] && (themeCon = jsUtil[fn](themeCon));
	});
	fs.writeFileSync(themejsPath, themeCon);


	//替换一些图片
	console.log('info: 替换favicon图片');
	let reader = fs.createReadStream('favicon.ico');
	let writer = fs.createWriteStream(path.join(GITBOOK, 'images', 'favicon.ico'));
	reader.pipe(writer);

	//添加一些样式
	console.log('info: 添加一些额外的样式');
	const cssPath = path.join(GITBOOK, 'style.css');
	let indexContent = fs.readFileSync(cssPath, 'utf8');
	indexContent += '.summary>li:first-child, .summary>li:last-child{display: none;}';
	indexContent += '.markdown-section>p:first-child{display:none;} .markdown-section h1{margin-top: 0!important;}';
	fs.writeFileSync(cssPath, indexContent);

	//执行构建
	console.log('info: 执行gulp');
	spawn('npm', ['run', 'start', 'gulp', 'build']);

	//删除一些文件
	console.log('info: 删除多余文件');
	fs.readdirSync(DIR).forEach((item) => {
		const arg1 = ['-rf'];
		const need = ['gitbook', 'src', 'index.html', 'search_index.json'];
		for(var i = 0, len = need.length; i < len; i++) {
			if(need[i] == item) {
				return;
			}
		}
		arg1.push(path.join(DIR, item));
		spawn('rm', arg1);
	});
}


let childObject = spawn('gitbook', ['build']);

childObject.stderr.on('data', (data) => {
	console.log(data.toString());
});

childObject.stdout.on('data', (data) => {
	console.log(data.toString());
});

childObject.on('close', ()=>{
	start();
});


//<script type="text/javascript">window.location="./src/1纷享CRM入门.html"</script>


