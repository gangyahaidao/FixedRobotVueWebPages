'use strict'
// Template version: 1.2.6
// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')
module.exports = {
  dev: {
    assetsSubDirectory: 'static',
    proxyTable: {},

    assetsPublicPath: '/',
    //assetsPublicPath: './', // 用于正式打包设置

    host: 'localhost', // npm run dev
    //host: '0.0.0.0', // 用于生产环境设置，不修改也没有影响  npm run build:prod
    port: 9527, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true, // 启动之后自动打开浏览器
    errorOverlay: true,
    notifyOnErrors: false,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    useEslint: true,
    showEslintErrorsInOverlay: false,
    devtool: '#cheap-source-map',
    cacheBusting: true,
    cssSourceMap: false,
  },

  build: {
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',

    assetsPublicPath: '/vue-element-admin/',
    //assetsPublicPath: './', // 用于正式打包设置

    productionSourceMap: false,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
