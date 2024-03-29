var chokidar = require('chokidar');
var path = require("path");
var fs = require("fs");
const os = require("os");
const colors = require("colors");
console.log("自动编译监听中...")
import utils from "./lib/utils"
const translateCompilePath = () => {

    console.log(path.join(__dirname,'../node_modules'));
   // return;
   var pathMap = new Map();
    chokidar.watch([path.join(__dirname,'../')], {
        ignored: [/^([\w\W]*)map$/, "./node_modules/*", "bin/node_modules/*"]
    }).unwatch([path.join(__dirname,'../node_modules')]).on('all', (event, path1) => {

        
        let tpath = path1.replace(/\\/g,'/')
       // console.log(tpath,'path ss');
        let extname = path.extname(path1);
        let fileName = path.basename(path1,'.js')
        if(extname != '.js' || (tpath.indexOf("/dpcore-core/debug.js") != -1) )
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
                let content = fs.readFileSync(fullpath);
                if( !( content && (content.indexOf("@dpCore") != -1) )  )
                {
                    //console.log("太靠近了");
                    return ;
                }
                
               
            }
           
        }
        
        if (fs.existsSync(fullpath)) {
            setTimeout(() => {
                let corePath = path.join(__dirname, "../dpcore-core");
                let codeContent = fs.readFileSync(fullpath).toString().replace(/@dpCore/g, corePath.replace(/\\/g, '/')) ;
                if (codeContent) {
                    //console.log("替换文件 ",new Date().getSeconds(), fullpath)
                    setTimeout(() => {
                        fs.writeFile(fullpath, codeContent,function(err){
                            if(err){
                                return console.log('写文件操作失败',err,fullpath);
                            } 
                            let msg:any = ` ${ utils.dateFormate(new Date(),"hh:mm:ss") } 编译 ${fileName}.ts`;
                            console.log(msg.cyan);
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
           

            autoTsc();
        }, 1000 * 60 * 2);
        console.log("typescript 自动编译监听中...");
}
translateCompilePath();
autoTsc();
setInterval(() => {
    //console.log("hahah")
}, 1000)