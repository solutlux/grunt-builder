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
                    sourceMapURL: "<%= project.sourceMapURL %>"
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
                    "<%= project.compressedFile %>": "<%= project.lessFolder %>/<%= project.lessFile %>"
                }
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
                args: ['-avz', '--verbose'],
                exclude: ['.git*', 'cache', 'log'],
                recursive: true
            },
            development: {
                options: {
                      src: "<%= project.cssFile %>",
                      dest: "<%= project.remoteGrunt %>/<%= project.cssGrunt %>",
                      host: 'almeyda@almeyda.biz',
                 //   port: 2222
                }
            }
        },
        //    sshexec: {
    //        development: {
    //            command: 'chown -R www-data:www-data /var/www/development',
    //            options: {
    //                host: 'www.localhost.com',
    //                username: 'root',
    //                port: 2222,
    //                privateKey: grunt.file.read("D:/Users/YOUR_USER/.ssh/id_containers_rsa")
    //            }
    //        }
    //    },
    };
    
    grunt.initConfig(config); 
    
    
// Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    // grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-prompt');
    // Task definition
    // grunt.registerTask('build', ['less', 'typescript', 'copy', 'concat_sourcemap', 'uglify']);
    // grunt.registerTask('default', ['watch']);
    grunt.loadNpmTasks('grunt-rsync');
    //grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask('build', ['less', 'copy']);
};