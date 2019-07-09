var chokidar = require('chokidar');
var path = require("path");
var fs = require("fs");
console.log("自动编译监听中...")
console.log()
const translateCompilePath = () => {


    chokidar.watch([path.join(__dirname, "../"), "*.js"], {
        ignored: [/^([\w\W]*)map$/]
    }).unwatch([path.join(__dirname, "../node_modules")]).on('all', (event, path1) => {

        let extname = path.extname(path1);
        if (extname == ".js" && path.basename(path1) != 'debug.js') {

            let corePath = path.join(__dirname, "../core");
            let codeContent = fs.readFileSync(path1).toString().replace(/@dpCore/g, corePath.replace(/\\/g, '/'));
            if (codeContent) {
                fs.writeFileSync(path1, codeContent)
                console.log("自动编译完成...", new Date().getSeconds())
            }

        }

    });
}
translateCompilePath();
setInterval(() => {
    //console.log("hahah")
}, 1000)