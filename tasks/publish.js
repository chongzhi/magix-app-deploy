/*
 * magix-app-deploy
 * https://github.com/chongzhi/magix-app-deploy
 *
 * Copyright (c) 2014 chongzhi
 * Licensed under the MIT license.
 */


module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  var tasks = __dirname.split('tasks')[0] + 'node_modules/grunt-*/tasks';
  //处理外层引用不到内层的node_modules问题
  grunt.file.expand(tasks).forEach(grunt.loadTasks);

  grunt.registerTask('publish', 'publish to cdn from gitlab', function() {
    var args = this.options() || {}
    var buildName = args.buildName || 'magix'
    var setVersion = args.setVersion
    var tag = grunt.template.today("yyyymmdd.HHMMss.l") //年月日.时分秒.毫秒

    grunt.initConfig({
      //自动打包发daily cdn流程 命令行工具
      shell: {

        //--------grunt publish---------
        checkout: {
          command: function() {
            return [
              'git checkout master',
              'git pull origin master' //更新本地master代码
            ].join('&&')
          }
        },

        setVersion: {
          command: function() {

            //将最新的vertion更新到index.html里面 -- 不过多干涉开发 -- 改成可配置
            if (setVersion) {
              var index = grunt.file.read(setVersion)
              grunt.file.write(setVersion, index.replace(/var version = \'.+\'/, "var version = '" + tag + "'"))
            }
            var cmds = setVersion ? ['git add . -A', 'git commit -m "set version in index.html" '] : []

            return cmds.concat([
              'git push origin master',
              'git checkout -b daily/' + tag
            ]).join('&&')
          }
        },

        //合并压缩magix app代码
        dailyBuild: {
          command: function() {
            return [
              'grunt ' + buildName,
              'git add . -A',
              //待解决：grunt shell对于没有更改文件的commit会报错, abort掉后面的操作
              //解决：加--force
              'git commit -m "build"'
            ].join('&&')
          }
        },

        dailyPushCdn: {
          command: 'git push origin daily/' + tag
        },

        //发布daily之后的cdn发布
        cdn: {
          command: function() {
            return [
              'git tag publish/' + tag,
              'git push origin publish/' + tag,

              'git checkout master',
              'git pull origin master',
              'git remote prune origin', //清理远程已发布的分枝
              'git branch -D daily/' + tag, //删除本地已发布的分枝
              'echo -e "\033[44;37m cdn发布成功，cdn版本号是：' + tag + ' \033[0m"'
            ].join('&&')
          }
        }
      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:checkout')
    grunt.task.run('shell:setVersion')
    grunt.task.run('shell:dailyBuild')
    grunt.task.run('shell:dailyPushCdn')
    grunt.task.run('shell:cdn')
  })

};