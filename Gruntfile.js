module.exports = function (grunt) {
    // Project configuration.

    /**
     *  For multi-task use multi:deploy or multi:build
     *  grunt multi:build --project=config1,config3,config2 --envt=config5
     **/

    function cloneConfig() {

        // Init arguments as variables
        var projectname = (new String(grunt.option('project'))).valueOf().split(',');
        var project = projectname.length == 1 && typeof(projectname[0]) != 'undefined' && projectname[0] != 'undefined' ? grunt.file.readJSON('../config/' + projectname[0] + '.json') : [];
        var envtname = grunt.option('envt');
        var envt = envtname ? grunt.file.readJSON('../config/' + envtname + '-env.json') : [];
        var projects = typeof(projectname) != 'undefined' ? projectname : [];
        projectname = projects.length ? projectname[0] : '';

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
            multi: {
                build: {
                    options: {
                        maxSpawn: 1,
                        vars: {
                            project: projects,
                        },
                        config: {
                            project: function( vars, rawConfig ){ return grunt.file.readJSON('../config/' + vars.project + '.json'); },
                            projectname: function( vars, rawConfig ){ return vars.project; },
                            envt: function( vars, rawConfig ){ return rawConfig.envt; }
                        },
                        tasks: ['build-full']
                    }
                },
                deploy: {
                    options: {
                        maxSpawn: 1,
                        vars: {
                            project: projects,
                        },
                        config: {
                            project: function( vars, rawConfig ){ return grunt.file.readJSON('../config/' + vars.project + '.json'); },
                            projectname: function( vars, rawConfig ){ return vars.project; },
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
    grunt.registerTask('build-full', ['clean:before', 'autospritesmith', 'newer:tinyimg', 'newer:imagemin', 'newer:less', 'concat', 'uglify', 'newer:copy', 'clean:after']);
    grunt.registerTask('build', ['imagemin', 'tinyimg', 'less', 'concat', 'uglify', 'copy']);

    grunt.registerTask('deploy:copyless', ['less', 'copy', 'deploy:global']);

    grunt.registerTask('deploy:shell', ['clean:before', 'newer:less', 'concat', 'uglify', 'newer:copy', 'rsync', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:js', ['js', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:dev-full', ['build-full', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:copy', ['copy', 'deploy:global']);
    grunt.registerTask('deploy:less', ['newer:less', 'deploy:global']);
    grunt.registerTask('deploy:global', ['shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:grunt', ['deploy:global']);
};
