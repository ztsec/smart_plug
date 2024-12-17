'use strict'

process.env.NODE_ENV = 'production'
const path = require('path')
const os = require("os");
const fse = require("fs-extra");

process.env.NODE_ENV = 'production'

const del = require('del')
const webpack = require('webpack')
const webConfig = require('./webpack.config')

web();

function web() {
    webConfig.mode = 'production'
    webpack(webConfig, (err, stats) => {
        if (err || stats.hasErrors()) console.log(err)

        console.log(stats.toString({
            chunks: false,
            colors: true
        }))
        release(__dirname);
        process.exit()
    })

}

function release(srcDir) {
    const pluginRootPath = path.join(os.homedir(), ".xtp-smart", "plugins");
    const pluginPath = path.join(pluginRootPath, path.basename(srcDir));
    fse.ensureDirSync(pluginPath);
    const filterFunc = (src, dest) => {
        return src.indexOf("index.html") == -1 && src.indexOf("index.js") == -1 && src.indexOf("node_modules") == -1 && src.indexOf(".gitignore") == -1 && src.indexOf(".lock") == -1 && src.indexOf(".vscode") == -1 && src.indexOf("src") == -1 && src.indexOf("webpack.config.js") == -1
    }
    fse.copySync(srcDir, pluginPath, { filter: filterFunc });
    console.log("发布成功");
}
