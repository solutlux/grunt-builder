module.exports = function (grunt) {
// Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        project: grunt.file.readJSON(grunt.option('project')+'.json'),
        less: {
            dev: {
                options: {
                    paths: ["<%= project.path %>"],
                    sourceMap: true
                   
                },
                files: [
                    {
                        expand: true,
                        cwd: "<%= project.lessFolder %>",
                        src: "<%= project.lessFile %>",
                        dest: "<%= project.cssFolder %>",
                        ext: ".css"
                    }
                ]
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
                files: "<%= project.concatFiles %>",
                options : {
                    sourceMap: true
                }    
            },
        },
        uglify: {
            prod : {
                src: "<%= project.publishedJsFiles %>/<%= project.implodedJsFile %>",
                dest: "<%= project.publishedJsFiles %>/<%= project.compressedJsFile %>",
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
                    dest: "<%= project.remoteDest %>",
                    host: "<%= project.remoteUsername %>@<%= project.remoteHost %>",
                    port: "<%= project.remotePort %>"
                }
            },
        },
        sshexec: {
            prod: {
                command: "<%= project.sshProdCommand %>",
                options: {
                    username: "<%= project.remoteUsername %>",
                    host: "<%= project.remoteHost %>",
                    port: "<%= project.remotePort %>",
                    privateKey: "<%= grunt.file.read(project.privateKeyPath) %>"
                }
            }
        },
        shell: {
            local: {
                command: "<%= project.shellLocalCommand %>",
            },
        }
    };
    
    grunt.initConfig(config); 
    
    
// Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-shell');

    // Task definition
    grunt.registerTask('build', ['less', 'copy']);
    grunt.registerTask('deploy:dev', ['less:dev', 'concat:dev', 'copy', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:skin', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:less', ['less:dev', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:global', ['rsync', 'sshexec']);
    
};