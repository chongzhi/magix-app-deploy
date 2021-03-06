# Magix项目gitlab自动部署工具

This is the tools used for the release of Magix Application


## 写在最前
    简述下这个工具期望的开发流程：
      1、来新需求了，从master 执行`grunt checkout` checkout一个开发用的daily分支，分支名会自动基于当前时间戳
      2、将daily分支名给到开发测试(如0.0.1，即magix所需要的cdn文件路径)，在daily分支执行`grunt daily`压缩代码并部署到daily环境，开发测试直接可以看到最新结果
      3、所有开发提测完毕，手动git checkout master回master分支执行grunt publish 即可发布代码到cdn上

## 使用方法

### 首次使用
* 安装node环境
* 安装grunt-cli http://gruntjs.com/getting-started (如果有0.4.0以下版本的grunt 请执行npm uninstall -g grunt卸载，再安装grunt-cli)

### 项目配置

#### 配置你项目的package.json如下：
    {
      "name": "scafflod",
      "version": "0.0.1", //此version必填，用来自动生成迭代的daily分支名
      "devDependencies": {
        "grunt": "~0.4.1",
        "time-grunt": "^0.3.2",
        "magix-app-build": "",
        "magix-app-deploy": ""
      }
    }


#### 配置你的Gruntfile.js 如下即可：
    grunt.loadNpmTasks('magix-app-deploy')

ps:此工具基于magix-app-build,请先配置它，工具地址：https://www.npmjs.org/package/magix-app-build

#### 执行npm install

### 工具使用:
  命令集：

  * 【master下】：`grunt checkout`
      - 从主干checkout一个新分支开发，版本号自动基于当前时间戳
  * 【daily下】： `grunt daily`
      - 在日常daily分支下开发的时候执行，包含了压缩以及push到daily服务器
  * 【master下】：`grunt publish`
      - 项目开发完毕正式发布cdn，将代码merge到master，从master执行grunt publish 一键发布，发布完成后会拿到版本号，给到开发即可


------------------------
### Gruntfile.js进阶配置：
    //以下配置可全部省略
    //从master分支执行 `grunt checkout` 会checkout一个daily分支为当前时间戳版的(此daily分支给测试使用)
    checkout: {
      options: {
        setVersion: 'index.html' // 配置是否在checkout daily分支的时候，就将daily分支写入index.html的version中，默认不写入
      }
    },

    //daily分支下执行 `grunt daily` 会压缩项目代码并push到当前daily分支(daily分支复用)
    daily: {
      options: {
        buildName: 'magix' // 配置压缩magix项目代码的命令名，默认名magix(内部会执行grunt magix这种命令，可以配置成你项目适合的压缩命令)
      }
    },

    //最后从master分支执行 `grunt publish` 发布代码到cdn，留意控制台里的cdn版本号(形如：20141022.210744.131)，给到开发测试上线使用
    publish: {
      options: {
        buildName: 'magix',
        setVersion: 'index.html'
      }
    }

### 实例参考:
  gitlab平台 thx/scaffold 脚手架仓库

