var chokidar = require('chokidar');
var path = require("path");
var fs = require("fs");
const os = require("os");
<<<<<<< HEAD
const colors = require("colors");
console.log("自动编译监听中...")
import utils from "./lib/utils"
=======
console.log("自动编译监听中...")
>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6
const translateCompilePath = () => {

    console.log(path.join(__dirname,'../node_modules'));
   // return;
   var pathMap = new Map();
    chokidar.watch([path.join(__dirname,'../')], {
        ignored: [/^([\w\W]*)map$/, "./node_modules/*", "bin/node_modules/*"]
    }).unwatch([path.join(__dirname,'../node_modules')]).on('all', (event, path1) => {

<<<<<<< HEAD
        
        let tpath = path1.replace(/\\/g,'/')
        //console.log(tpath);
        let extname = path.extname(path1);
        if(extname != '.js' || (tpath.indexOf("/core/debug.js") != -1) )
=======
        //console.log(path1);
        let extname = path.extname(path1);
        if(extname != '.js')
>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6
        {
            return;
        }
        //console.log(path1);
        let fullpath = path1;
        let nowtime = new Date().getTime();
        let lasttime = pathMap.get(fullpath);
       
        if(lasttime && !isNaN(lasttime))
        {
            //console.log(nowtime - lasttime,'时间间隔')
            if((nowtime - lasttime) < 1300)
            {
<<<<<<< HEAD
                let content = fs.readFileSync(fullpath);
                if( !( content && (content.indexOf("@dpCore") != -1) )  )
                {
                    //console.log("太靠近了");
                    return ;
                }
                //console.log("太靠近了");
               
=======

                //console.log("太靠近了");
                return ;
>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6
            }
           
        }
        //let basename = path.basename(path1);
        //let fullpath = path.join(__dirname, "../", path1.replace(".ts", '.js'))
        
        //console.log(fullpath);

        if (fs.existsSync(fullpath)) {
            setTimeout(() => {
                let corePath = path.join(__dirname, "../core");
                let codeContent = fs.readFileSync(fullpath).toString().replace(/@dpCore/g, corePath.replace(/\\/g, '/')) ;
                if (codeContent) {
                    //console.log("替换文件 ",new Date().getSeconds(), fullpath)
                    setTimeout(() => {
                        fs.writeFile(fullpath, codeContent,function(err){
<<<<<<< HEAD
                            if(err){
                                return console.log('写文件操作失败',err,fullpath);
                            } 
                            let msg:any = ` ${ utils.dateFormate(new Date(),"hh:mm:ss") } 编译结果写文件成功 `;
                            console.log(msg.cyan);
=======
                            if(err) return console.log('写文件操作失败',err,fullpath);
                            else console.log('编译结果写文件成功 ');
>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6
                            pathMap.set(fullpath,new Date().getTime())
                        });
                    }, 1000);
                }
            }, 200);
        }

    });
}

const autoTsc = ()=>{
    var nodecmd = require('node-cmd');
        var cmd = 'tsc -p tsconfig.json  --watch';
        var ostype  = os.type();
        var tsProcessKill = null; //kill -9 PID
        const processRef = nodecmd.get(cmd);

        switch(ostype)
        {
            case "Windows_NT":
                tsProcessKill = `taskkill /pid ${processRef.pid}  -t  -f`
                break;
            case "Darwin" || 'Linux':
                tsProcessKill = `kill -9 ${processRef.pid} `
                break;
        }
        processRef.stdout.on(
            'data',
            function (data) {
                //data_line += data;
                console.log("typescript 编译提示:"+data);
            }
        )
        processRef.stdout.on(
            'close',
            function (data) {
                //data_line += data;
                console.log("ts 编译进程衰老:");
            }
        )
        setTimeout(() => {
            
            nodecmd.get(tsProcessKill,()=>{
                console.log("编译进程重启...")
            })
            // setTimeout(() => {
            //     process.send({
            //         code: "restart",
            //         data: 'autoTsc'
            //     })
            //     process.exit();
            // }, 1000*1);

            autoTsc();
        }, 1000 * 60 * 5);
        console.log("typescript 自动编译监听中...");
}
translateCompilePath();
autoTsc();
setInterval(() => {
    //console.log("hahah")
}, 1000)