var fs = require("fs");
var path = require("path");
if(fs.existsSync(path.join(__dirname,"../../../dpcore-core/package.json")) &&  !fs.existsSync(path.join(__dirname,"../../package.json")))
{
    let data = fs.readFileSync(path.join(__dirname,"../../../dpcore-core/package.json"))
    if(data)
    {
        fs.writeFileSync(path.join(__dirname,"../../package.json"),data);
        console.log("复制package.json 文件");
    }
}