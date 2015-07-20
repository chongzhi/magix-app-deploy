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

  grunt.registerTask('daily', 'build and push daily branch', function(e, d) {
    var args = this.options() || {}
    var buildName
    if (args.buildName === undefined) {
      buildName = 'magix'
    }
    // var buildName = args.buildName || 'magix'

      //获取切换分支前的分支名
    function getCurrentBranch() {
      var branchs = grunt.file.read('current_branch.md')
      var current = /.*\*\s([\S]+)\s*/.exec(branchs)[1] //拿到当前分支名
      console.log('所有分支：====> \n' + branchs)
      console.log('当前分支：====> ' + current + '\n')
      return current
    }

    //获取当前项目名称，拼出cdn 或 daily 最终地址
    function getProjectName() {
      var pwd = grunt.file.read('pwd.md').trim().split('/')
      var projectName = pwd[pwd.length - 1]
      return projectName
    }

    grunt.initConfig({

      //自动打包发daily cdn流程 命令行工具
      shell: {
        //--------grunt daily---------

        //git branch
        saveBranch: {
          command: function() {
            return [
              'pwd > pwd.md',
              'git branch > current_branch.md' //将当前分支信息临时写入文件，后面读取，同时防止commit没有更改的文件报错，abort流程
            ].join('&&')
          }
        },

        //合并压缩magix app代码
        dailyBuild: {
          command: function() {
            // var currentBranch = getCurrentBranch()

            var commands = [
              'git add . -A',
              'git commit -m "daily"'
            ]

            if (buildName) {
              commands.unshift('grunt ' + buildName)
            }

            return commands.join('&&')
          }
        },
        dailyPush: {
          command: function() {
            var currentBranch = getCurrentBranch()
            var projectName = getProjectName()

            return [
              'rm current_branch.md',
              'rm pwd.md',
              'git add . -A',
              'git commit -m "daily"',
              'git push origin ' + currentBranch,
              'echo "\033[44;37m ' + currentBranch + '分支压缩并发布成功 \033[0m"',
              'echo "\033[35m daily文件完整目录地址是：http://g-assets.daily.taobao.net/mm/'+ projectName +'/'+ currentBranch.split('/')[1] +'/ \033[0m"'
            ].join('&&')
          }
        }

      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:saveBranch')
    grunt.task.run('shell:dailyBuild')
    grunt.task.run('shell:dailyPush')
  })

};