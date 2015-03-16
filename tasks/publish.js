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

    //获取切换分支前的分支名
    function getCurrentBranch() {
      var branchs = grunt.file.read('current_branch.md')
      var current = /.*\*\s([\S]+)\s*/.exec(branchs)[1] //拿到当前分支名
      console.log('所有分支：====> \n' + branchs)
      console.log('当前分支：====> ' + current + '\n')
      return current
    }

    grunt.initConfig({
      //自动打包发daily cdn流程 命令行工具
      shell: {

        //--------grunt publish---------

        //git branch
        saveBranch: {
          command: function() {
            return [
              'git branch > current_branch.md' //将当前分支信息临时写入文件，后面读取，同时防止commit没有更改的文件报错，abort流程
            ].join('&&')
          }
        },

        pushCurrent: {
          command: function() {
            var currentBranch = getCurrentBranch()
            return [
              'git add . -A',
              'git commit -m "publish"',
              'git push origin ' + currentBranch,
              'git merge master'
            ].join('&&')
          }
        },

        //checkout
        checkout: {
          command: function() {
            var currentBranch = getCurrentBranch()
            return [
              'git checkout master',
              'git pull origin master', //更新本地master代码
              'git merge ' + currentBranch
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
              'git branch > current_branch.mdd', //防止commit没有更改的文件报错，abort流程
              'git add . -A',
              'git commit -m "build"'
            ].join('&&')
          }
        },

        dailyPushCdn: {
          command: function() {
            return [
              'rm current_branch.mdd',
              'git add . -A',
              'git commit -m "build"',
              'git push origin daily/' + tag
            ].join('&&')
          }
        },

        //发布daily之后的cdn发布
        cdn: {
          command: function() {
            var currentBranch = getCurrentBranch()
            return [
              'git tag publish/' + tag,
              'git push origin publish/' + tag,
              'git checkout master',
              'git pull origin master',
              'git remote prune origin', //清理远程已发布的分枝
              'git branch -D daily/' + tag, //删除本地已发布的分枝
              'rm current_branch.md',
              'git add . -A',
              'git commit -m "delete current_branch.md"',
              'git push origin master',
              'git checkout ' + currentBranch,
              'git merge master',
              'git push origin ' + currentBranch,
              'echo -e "\033[44;37m cdn发布成功，cdn版本号是: ' + tag + ' \033[0m"'
            ].join('&&')
          }
        }
      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:saveBranch')
    grunt.task.run('shell:pushCurrent')
    grunt.task.run('shell:checkout')
    grunt.task.run('shell:setVersion')
    grunt.task.run('shell:dailyBuild')
    grunt.task.run('shell:dailyPushCdn')
    grunt.task.run('shell:cdn')
  })

};