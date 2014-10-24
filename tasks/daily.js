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
    var buildName = args.buildName || 'magix'

    grunt.initConfig({

      //自动打包发daily cdn流程 命令行工具
      shell: {
        //--------grunt daily---------
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
        dailyPush: {
          command: function() {
            var pkg = grunt.file.readJSON('package.json')
            var version = pkg.version

            return [
              'git push origin daily/' + version,
              'echo -e "\033[44;37m daily/ ' + version + ' 分支压缩并发布成功 \033[0m"'
            ].join('&&')
          }
        }

      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:dailyBuild')
    grunt.task.run('shell:dailyPush')
  })

};