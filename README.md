# Magix项目gitlab自动部署工具

This is the tools used for the release of Magix Application

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

  * `grunt checkout` (master下) -- 基于master的package.json的version+1为daily名称，checkout新开发分支
  * `grunt daily` (daily分支下) -- 基于daily分支的magix压缩，发布daily环境
  * `grunt publish` (master下) -- 基于master的发布cdn

### 实例参考:
  gitlab平台 thx/scaffold 脚手架仓库

