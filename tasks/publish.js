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
    var buildName
    if (args.buildName === undefined) {
      buildName = 'magix'
    }
    // var buildName = args.buildName || 'magix'
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
        saveBranch: {
          command: function() {
            return [
              'git checkout master',
              'git branch > current_branch.md' //将当前分支信息临时写入文件，后面读取，同时防止commit没有更改的文件报错，abort流程
            ].join('&&')
          }
        },

        build: {
          command: function() {

            //将最新的vertion更新到index.html里面 -- 不过多干涉开发 -- 改成可配置
            if (setVersion) {
              var index = grunt.file.read(setVersion)
              grunt.file.write(setVersion, index.replace(/var version = \'.+\'/, "var version = '" + tag + "'"))
            }

            var currentBranch = getCurrentBranch()
            var commands = [
              'git add . -A',
              'git commit -m "by magix-app-deploy - 崇志"',
              'git push origin ' + currentBranch //master
            ]

            if (buildName) {
              commands.unshift('grunt ' + buildName)
            }

            return commands.join('&&')

          }
        },

        //合并压缩magix app代码
        checkoutDaily: {
          command: function() {
            return [
              'git checkout -b daily/' + tag,
              'git push origin daily/' + tag
            ].join('&&')
          }
        },


        //发布daily之后的cdn发布
        cdn: {
          command: function() {
            // var currentBranch = getCurrentBranch()
            return [
              'git tag publish/' + tag,
              'git push origin publish/' + tag,
              'git checkout master',
              // 'git pull origin master',
              'git branch -D daily/' + tag, //删除本地已发布的daily分枝
              // 'git push origin :daily/' + tag, //删除远程已发布的daily分枝,
              // 不能直接删除远程daily分支，因为发布cdn还未成功
              // 稍后执行git remote prune origin 清理远程daily分支
              'rm current_branch.md',
              'git add . -A',
              'git commit -m "delete current_branch.md"',
              'git push origin master',
              'echo -e "\033[44;37m cdn发布成功，cdn版本号是: ' + tag + ' \033[0m"',
              'git remote prune origin' //清理远程已发布的分枝
            ].join('&&')
          }
        }
      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:saveBranch')
    grunt.task.run('shell:build')
    grunt.task.run('shell:checkoutDaily')
    grunt.task.run('shell:cdn')

  })

};