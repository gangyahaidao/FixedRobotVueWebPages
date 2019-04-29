# SellRobotVueWebPages
零售机器人后台页面VUE工程

## element-ui样式网址：
[http://element-cn.eleme.io/#/zh-CN/component/installation](http://element-cn.eleme.io/#/zh-CN/component/installation)

## 环境初始化
    1.开发和生产的切换在配置文件：config/index.js中
    2.安装依赖：npm install
    3.启动开发模式：npm run dev

## 编译发布
    1.测试环境发布：npm run build:sit
    2.生产环境发布：npm run build:prod    

## 其他
    # --显示编译文件大小分析
    npm run build:prod --report

    # --生成编译分析文件. default: bundle-report.html
    npm run build:prod --generate_report

    # --在本地开启一个预览服务查看效果
    npm run build:prod --preview

    # 修改代码样式符合ESLint
    npm run lint

    # 自动修复ESLint报错
    npm run lint -- --fix
    