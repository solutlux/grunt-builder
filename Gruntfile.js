module.exports = function (grunt) {
// Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        project: grunt.file.readJSON(grunt.option('project')+'.json'),
        less: {
            dev: {
                options: {
                    paths: ["<%= project.path %>"],
                    sourceMap: true,
                    sourceMapURL: "<%= project.cssSourceMapURL %>"
                },
                files: {
                    "<%= project.cssFile %>": "<%= project.lessFolder %>/<%= project.lessFile %>"
                }
            },
            prod: {
                options: {
                    paths: ["<%= project.path %>"],
                    //sourceMap: true,
                    compress: true
                },
                files: {
                    "<%= project.compressedCssFile %>": "<%= project.lessFolder %>/<%= project.lessFile %>"
                }
            }
        },
        concat: {
            dev: {
                src: "<%= project.srcJsFiles %>",
                dest: "<%= project.implodedJsFile %>",
                options : {
                    sourceMap: true
                }    
            },
        },
        uglify: {
            options : {
              sourceMap : true,
              sourceMapIncludeSources : true,
              sourceMapIn : '.tmp/main.js.map'
            },
            dist : {
              src  : '<%= concat.dist.dest %>',
              dest : 'www/main.min.js'
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ["<%= project.fontsFile %>"], dest: "<%= project.fontsCopy %>", filter: 'isFile'}
               ]
            }
        },
        watch: {
            scripts: {
                files: ['<%= project.lessFolder %>/*.less'],
                tasks: ['less:dev'],
            },
        },
        rsync: {
            options: {
                args: "<%= project.rsyncArgs %>",
                exclude: "<%= project.rsyncExclude %>",
                include: "<%= project.rsyncInclude %>",
                recursive: true
            },
            dev: {
                options: {
                    src: "<%= project.localSrc %>",
                    dest: "<%= project.remoteSrc %>",
                    host: "<%= project.remoteUsername %>@<%= project.remoteHost %>",
                    port: "<%= project.remotePort %>"
                }
            }
        },
        sshexec: {
            prod: {
                command: "<%= project.sshCommands %>",
                options: {
                    username: "<%= project.remoteUsername %>",
                    host: "<%= project.remoteHost %>",
                    port: "<%= project.remotePort %>",
                    privateKey: "<%= grunt.file.read(project.privateKeyPath) %>"
                }
            }
        },
    };
    
    grunt.initConfig(config); 
    
    
// Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-ssh');

    // Task definition
    grunt.registerTask('build', ['less', 'copy']);
    grunt.registerTask('deploy:dev', ['less:dev', 'concat:dev', 'copy', 'rsync', 'sshexec']);
};