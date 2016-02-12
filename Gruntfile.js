module.exports = function (grunt) {
    // Project configuration.

    function cloneConfig() {
        
        var config = {
            pkg: grunt.file.readJSON('package.json'),
            local: grunt.file.readJSON('local.json'),
            envt: grunt.file.readJSON('../config/' + grunt.option('envt') + '-env.json'),
            envtname: grunt.option('envt'),
            project: grunt.file.readJSON('../config/' + grunt.option('project') + '.json'),
            projectname: grunt.option('project'),
            less: {
                prod: {
                    options: {
                        sourceMap: "<%= project.cssSourceMap %>",
                        compress: "<%= project.cssCompress %>",
                    },
                    files: "<%= project.lessFiles %>"
                }
            },
            cssmin: {
                target: {
                    files: "<%= project.cssMinFiles %>"
                }
            },
            concat: {
                dev: {
                    files: "<%= project.concatFiles %>",
                    options: {
                        sourceMap: "<%= project.concatSourceMap %>"
                    }
                },
            },
            uglify: {
                options: {
                    mangle: "<%= project.uglifyMangle %>",
                    sourceMap: "<%= project.uglifySourceMap %>"
                },
                prod: {
                    files: "<%= project.uglifyFiles %>",
                }
            },
            copy: {
                main: {
                    files: "<%= project.copyFiles %>",
                }
            },
            clean: {
                options: {
                    force: true
                },
                before: "<%= project.cleanBeforeFiles %>",
                after: "<%= project.cleanAfterFiles %>"
            },
            autospritesmith: {
                options: "<%= project.spriteOptions %>",
                all: "<%= project.spriteFiles %>",
            },
            imagemin: {
                dynamic: {
                    files: "<%= project.imageminFiles %>"
                }
            },
            tinyimg: {
                dynamic: {
                    files: "<%= project.tinyimgFiles %>"
                }
            },
            rename: {
                options: {
                    force: true
                },
                main: {
                    files: "<%= project.renameFiles %>"
                }
            },
            watch: {
                less: {
                    files: "<%= project.watchLessFiles %>",
                    tasks: "<%= project.watchLessTasks %>",
                },
                scripts: {
                    files: "<%= project.watchScriptsFiles %>",
                    tasks: "<%= project.watchScriptsTasks %>",
                },
                html: {
                    files: "<%= project.watchHtmlFiles %>",
                    tasks: "<%= project.watchHtmlTasks %>",
                }
            },
            sshexec: {
                prod: {
                    command: "<%= project.sshCommands %>",
                },
                deploy: {
                    command: "<%= project.sshDeployCommands %>",
                },
                options: {
                    username: "<%= project.remoteUsername %>",
                    host: "<%= project.remoteHost %>",
                    port: "<%= project.remotePort %>",
                    privateKey: "<%= grunt.file.read(envt.privateKeyPath) %>"
                }
            },
            shell: {
                local: {
                    command: "<%= project.shellLocalCommand %>",
                },
                rsync: {
                    command: "<%= project.shellRsyncCommand %>",
                },
            },
            run_grunt: {
                options: {
                    minimumFiles: 1,
                    log: true,
                },
                target: {
                    options: {
                        task: "<%= project.gruntTasks %>",
                        expectFail: true,
                        gruntOptions: {
                            envt: "<%= project.gruntEnvt %>",
                            project: "<%= project.gruntProject %>"
                        }
                    },
                    src: ["Gruntfile.js"]
                },
            },
        }
        
        return config;
    }
    
    grunt.initConfig(cloneConfig());
    
    // Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble-less');
    
    // Task definition
    grunt.registerTask('js', ['concat', 'uglify']);
    grunt.registerTask('build-full', ['clean:before', 'run_grunt', 'autospritesmith', 'newer:tinyimg', 'newer:imagemin', 'newer:less', 'concat', 'uglify', 'newer:copy', 'clean:after']);
    grunt.registerTask('build', ['imagemin', 'tinyimg', 'less', 'concat', 'uglify', 'copy']);
    
    grunt.registerTask('deploy:copyless', ['less', 'copy', 'deploy:global']);
    
    grunt.registerTask('deploy:shell', ['clean:before', 'newer:less', 'concat', 'uglify', 'newer:copy', 'rsync', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:js', ['js', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:dev-full', ['build-full', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:copy', ['copy', 'deploy:global']);
    grunt.registerTask('deploy:less', ['newer:less', 'deploy:global']);
    grunt.registerTask('deploy:global', ['shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:grunt', ['run_grunt', 'deploy:global']);
};