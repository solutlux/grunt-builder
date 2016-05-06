module.exports = function (grunt) {
    // Project configuration.

    function cloneConfig() {

        if (grunt.option('multi-single') == undefined) {
            // Init arguments as variables
            var projectname = grunt.option('project');
            var project = grunt.file.readJSON('../config/' + projectname + '.json');
            var envtname = grunt.option('envt');
            var envt = grunt.file.readJSON('../config/' + envtname + '-env.json');
        } else {
            /*  Default values for grunt-multi,
             will rewrited by Config array */
            if (projectname == undefined) {
                var projectname = '';
            }
            if (project == undefined) {
                var project = [];
            }
            if (envtname == undefined) {
                var envtname = '';
            }
            if (envt == undefined) {
                var envt = [];
            }
        }

        var config = {
            pkg: grunt.file.readJSON('package.json'),
            local: grunt.file.readJSON('local.json'),
            envt: envt,
            envtname: envtname,
            project: project,
            projectname: projectname,
            less: {
                prod: {
                    options: {
                        sourceMap: "<%= project.cssSourceMap %>",
                        compress: "<%= project.cssCompress %>"
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
                }
            },
            uglify: {
                options: {
                    mangle: "<%= project.uglifyMangle %>",
                    sourceMap: "<%= project.uglifySourceMap %>"
                },
                prod: {
                    files: "<%= project.uglifyFiles %>"
                }
            },
            copy: {
                main: {
                    files: "<%= project.copyFiles %>"
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
                all: "<%= project.spriteFiles %>"
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
                    tasks: "<%= project.watchLessTasks %>"
                },
                scripts: {
                    files: "<%= project.watchScriptsFiles %>",
                    tasks: "<%= project.watchScriptsTasks %>"
                },
                html: {
                    files: "<%= project.watchHtmlFiles %>",
                    tasks: "<%= project.watchHtmlTasks %>"
                }
            },
            sshexec: {
                prod: {
                    command: "<%= project.sshCommands %>"
                },
                deploy: {
                    command: "<%= project.sshDeployCommands %>"
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
                    command: "<%= project.shellLocalCommand %>"
                },
                rsync: {
                    command: "<%= project.shellRsyncCommand %>"
                }
            },
            run_grunt: {
                options: {
                    minimumFiles: 1,
                    log: true
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
                }
            },
            multi: {
                build: {
                    options: {
                        maxSpawn: 1,
                        vars: {
                            subProject: project.projects,
                        },
                        config: {
                            project: function( vars, rawConfig ){ return grunt.file.readJSON('../config/' + vars.subProject + '.json'); },
                            projectname: function( vars, rawConfig ){ projectname = vars.subProject; return vars.subProject; },
                            envt: function( vars, rawConfig ){ return rawConfig.envt; }
                        },
                        tasks: ['build-full']
                    }
                },
                deploy: {
                    options: {
                        maxSpawn: 1,
                        vars: {
                            subProject: project.projects,
                        },
                        config: {
                            project: function( vars, rawConfig ){ return grunt.file.readJSON('../config/' + vars.subProject + '.json'); },
                            projectname: function( vars, rawConfig ){ projectname = vars.subProject; return vars.subProject; },
                            envt: function( vars, rawConfig ){ return rawConfig.envt; }
                        },
                        tasks: ['deploy:dev-full']
                    }
                }
            }
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
