const log4js = require("log4js");
var path = require('path');

log4js.configure({
    appenders: {
        everything: {
            type: 'dateFile',
            filename: process.cwd() + '/logs/all-the-logs.log',
            maxLogSize: 1048576,
            backups: 3,
            compress: true
        }
    },
    categories: {
        default: {
            appenders: ['everything'],
            level: 'debug'
        }
    }
});
const logger = log4js.getLogger('log4jslog');

function log(msg)
{
    if($config.debug == 1)
    {
        console.log("日志输出: ",msg);
    }
}


 export default {
    error: (msg) => {
        log(msg)
        logger.error(msg);
    },
    trace: (msg) => {
        log(msg)
        logger.trace(msg);
    },
    info: (msg) => {
        log(msg)
        logger.info(msg);
    },

    debug: (msg) => {
        log(msg)
        logger.debug(msg);
    },
    warn: (msg) => {
        log(msg)
        logger.warn(msg);
    },
    fatal: (msg) => {
        log(msg)
        logger.fatal(msg);
    },
    

}
