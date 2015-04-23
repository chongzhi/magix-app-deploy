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

  grunt.registerTask('checkout', 'checkout daily branch from master', function() {
    var args = this.options() || {}
    var setVersion = args.setVersion

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
        getBranchName: {
          command: function() {
            return [
              'git branch > current_branch.md'
            ].join('&&')
          }
        },
        //------grunt checkout--------
        gotoMaster: {
          command: function() {
            var notMaster = getCurrentBranch() !== 'master'

              if (notMaster) { //必须在master下执行
                return [
                  'rm current_branch.md',
                  ':::::请切到master分支再执行该命令:::::'
                ].join('&&')
              } else {
                return [
                  'rm current_branch.md',
                  'git pull origin master'
                ].join('&&')
              }
          }
        },
        checkoutDaily: {
          command: function() {

            //获取package.json里的version并+1
            var pkg = grunt.file.readJSON('package.json')
            var version = pkg.version.split('.')
            var last = parseInt(version.pop(), 10) + 1
            version.push(last)
            var _version = version.join('.')

            //将+1后的version写入package.json
            pkg.version = _version
            grunt.file.write('package.json', JSON.stringify(pkg, null, 2))


            //将最新的vertion更新到index.html里面 -- 不过多干涉开发 -- 改成可配置
            if (setVersion) {
              var index = grunt.file.read(setVersion)
              grunt.file.write(setVersion, index.replace(/var version = \'.+\'/, "var version = '" + _version + "'"))
            }

            return [
              'git add . -A',
              'git commit -m "commit"',
              'git push origin master',
              'git checkout -b daily/' + _version,
              'echo -e "\033[44;37m checout开发daily分支成功，分支号为: ' + _version + ' ，此daily分支可重复使用，在此分支下执行grunt daily即可发布到daily环境 \033[0m"'
            ].join('&&')
          }
        }
      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:getBranchName')
    grunt.task.run('shell:gotoMaster')
    grunt.task.run('shell:checkoutDaily')

  })

};