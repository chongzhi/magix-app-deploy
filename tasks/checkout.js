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

    grunt.initConfig({
      //自动打包发daily cdn流程 命令行工具
      shell: {
        //------grunt checkout--------
        gotoMaster: {
          command: function() {
            return [
              'git checkout master',
              'git pull origin master'
            ].join('&&')
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
              'echo -e "\033[44;37m checout开发daily分支成功，分支号为: ' + _version + ' ，此daily分支为覆盖复用发布 \033[0m"'
            ].join('&&')
          }
        }
      }
    })

    //从master checkout一个daily分支来开发项目
    grunt.task.run('shell:gotoMaster')
    grunt.task.run('shell:checkoutDaily')

  })

};