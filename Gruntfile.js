module.exports = function (grunt) {
    // Project configuration.

    /**
     *  For multi-task use run task
     *  grunt run --project=config1,config3,config2 --envt=config5 --task=less,js
     *  Config can has 'tasks' variable
     *  Option 'task' will rewrite config if exists
     **/

    /**
     *
     * New feature
     *
     * grunt -run --envt=config5 --project=config1[task1,task2],config2[task3],config3[task4]
     *
     **/

    function cloneConfig() {

        // Init arguments as variables
        var projectTasks = [];
        projects = [];

        reg = /([a-z-]+)\[([a-z-:,]+)\]/ig;
        if (typeof(projectname) == 'undefined') {
            var projectname = grunt.option('project');
            if (typeof(projectname) == 'string') {
                projectsData = projectname.match(reg);
                if ((typeof(projectsData) == 'array' || typeof(projectsData) == 'object') && projectsData && projectsData.length) {
                    projectname = [];
                    subReg = /([a-z-]+)\[([a-z-:,]+)\]/i;
                    projectsData.forEach(function (projectString, i, arr) {
                        if (typeof(projectString) == 'string') {
                            projectData = projectString.match(subReg);
                            if ((typeof(projectData) == 'object' || typeof(projectData) == 'array') && projectData && projectData.length == 3) {
                                projectname.push(projectData[1]);
                                projects.push(projectData[1]);
                                currentTasks = (new String(projectData[2])).valueOf().split(',');
                                if (typeof(currentTasks[0] != 'undefined') && currentTasks[0] != '') {
                                    projectTasks[projectData[1]] = currentTasks;
                                }
                            }
                        }
                    });
                } else {
                    projectname = (new String(projectname)).valueOf().split(',');
                }
            }
        }


        var project = (typeof(projectname) == 'array' || typeof(projectname) == 'object') && typeof(projectname[0]) != 'undefined' && projectname[0] != 'undefined' ? grunt.file.readJSON('../config/' + projectname[0] + '.json') : [];
        var envtname = grunt.option('envt');
        var envt = envtname ? grunt.file.readJSON('../config/' + envtname + '-env.json') : [];

        var optionTasks = (new String(grunt.option('tasks'))).valueOf().split(',');
        if (typeof(projectname) == 'array' || typeof(projectname) == 'object') {
            if (typeof(optionTasks) != 'undefined' && optionTasks.length) {
                projectname.forEach(function (key, i, arr) {
                    if (typeof(projectTasks[key]) == 'undefined') {
                        if (typeof(optionTasks[0] != 'undefined') && optionTasks[0] != '') {
                            projectTasks[key] = optionTasks;
                        }
                    }
                });
            }
        }
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
            sass: {
                dist: {
                    options: {
                        sourcemap: "<%= project.cssSourceMap %>"
                    },
                    files: "<%= project.sassFiles %>"
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
                    sourceMap: "<%= project.uglifySourceMap %>",
                    beautify: "<%= project.uglifySourceMap %>",
                    sourceMapIncludeSources: "<%= project.uglifySourceMap %>"
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
            tinyimgcust: {
                dynamic: {
                    files: "<%= project.tinyimgFiles %>"
                }
            },
            cwebp: {
                dynamic: {
                    options: "<%= project.webpOptions %>",
                    files: "<%= project.convertingImages %>"
                }
            },
            modernizr: {
                dist: "<%= project.modernizrOptions %>"
            },
            command_run: {
                //Requires the imagemagick library. Please install first
                convert_to_jp2: {
                    options: {
                        getCommand: function (filepath, dest) {
                            return 'mogrify -format jp2 -path ' + dest.slice(0, dest.lastIndexOf('/') - dest.length + 1) + ' ' + filepath;
                        },
                        quiet: true
                    },
                    files: "<%= project.convertingImages %>"
                },
                //Requires the jxrlib library. Please install first
                convert_to_jxr: {
                    options: {
                        getCommand: function (filepath, dest) {
                            return 'convert '+filepath+' jxr:' + dest.slice(0, dest.lastIndexOf('.') - dest.length + 1) + 'jxr';
                        },
                        quiet: false
                    },
                    files: "<%= project.convertingImages %>"
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
                php: {
                    command: typeof(project.shellPhpCommands) == 'array' || typeof(project.shellPhpCommands) == 'object' ? project.shellPhpCommands.join(' && ') : "<%= project.shellPhpCommand %>",
                },
                local: {
                    command: typeof(project.shellLocalCommands) == 'array' || typeof(project.shellLocalCommands) == 'object' ? project.shellLocalCommands.join(' && ') : "<%= project.shellLocalCommand %>",
                    options: {
                        execOptions: {
                            maxBuffer: Infinity
                        }
                    }
                },
                rsync: {
                    command: typeof(project.shellRsyncCommands) == 'array' || typeof(project.shellRsyncCommands) == 'object' ? project.shellRsyncCommands.join(' && ') : "<%= project.shellRsyncCommand %>",
                }
            },
            multi: {
                run: {
                    options: {
                        maxSpawn: 1,
                        vars: {
                            project: projects,
                        },
                        config: {
                            project: function (vars, rawConfig) {
                                projectName = vars.project.replace(/\[([a-z-:,]+)\]/, '');
                                if (projectName == vars.project) {
                                    projectName = vars.project.replace(/\[([a-z-:,]+)/, '').replace(/([a-z-:,]+)\]/, '');
                                }
                                if (grunt.file.exists('../config/' + projectName + '.json')) {
                                    project = grunt.file.readJSON('../config/' + projectName + '.json');
                                    if (typeof(projectTasks[projectName]) != 'undefined' && projectTasks[projectName].length) {
                                        project.tasks = projectTasks[projectName];
                                    }
                                    return project;
                                }
                                return [];
                            },
                            projectname: function (vars, rawConfig) {
                                return vars.project;
                            },
                            envt: function (vars, rawConfig) {
                                return rawConfig.envt;
                            }
                        },
                        tasks: []
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
    grunt.loadNpmTasks('grunt-contrib-sass');
    // Task definition
    grunt.registerTask('js', ['concat', 'uglify']);
    grunt.registerTask('build-full', ['clean:before', 'autospritesmith', 'build', 'clean:after']);
    grunt.registerTask('build', ['convertimg', 'imagemin', 'tinyimgcust', 'less', 'sass', 'concat', 'uglify', 'copy', 'modernizrcust']);

    grunt.registerTask('deploy:copyless', ['less', 'copy', 'deploy:global']);

    grunt.registerTask('deploy:shell', [
        'clean:before',
        'less',
        'concat',
        'uglify',
        'copy',
        'rsync',
        'deploy:global'
    ]);
    grunt.registerTask('deploy:js', ['js', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:dev-full', ['build-full', 'deploy:global']);
    grunt.registerTask('deploy:copy', ['copy', 'deploy:global']);
    grunt.registerTask('deploy:less', ['less', 'deploy:global']);
    grunt.registerTask('deploy:php', ['shell:php', 'deploy:global']);
    grunt.registerTask('deploy:php-full', ['build-full', 'shell:php', 'deploy:global']);
    grunt.registerTask('deploy:global', ['shell:local', 'sshexec:prod']);
    grunt.registerTask('run', ['multi:run']);

    // Hack for multi-single task
    grunt.registerTask('multi-single', 'The single task for multi', function () {
        // Get the raw config and try to update.
        var rawConfig = grunt.config.getRaw();
        // Get the special config
        var singleInfo = JSON.parse(process.env._grunt_multi_info);
        var singleCfg = singleInfo.config;
        var singleTasks = singleInfo.tasks;
        var singleBeginLog = singleInfo.beginLog;
        grunt.log.writeln();
        if (singleBeginLog) {
            grunt.log.ok(singleBeginLog);
        }
        // Combine with the raw config.
        grunt.util._.each(singleCfg, function (value, key) {
            rawConfig[key] = value;
        });
        // Replace the origin config.
        grunt.config.init(rawConfig);
        if (typeof(rawConfig.project.tasks) != 'undefined' && rawConfig.project.tasks.length) {
            // config can have 'tasks' array
            singleTasks = rawConfig.project.tasks;
        }
        // Execute tasks
        if (singleTasks.length) {
            grunt.task.run(singleTasks);
        }
    });

    // Hack for tiny-img task
    grunt.registerTask('tinyimgcust', 'The custom task for tinyimg', function () {
        // Check if files set
        var rawConfig = grunt.config.getRaw();
        if (typeof rawConfig.project.tinyimgFiles !== 'undefined') {
            grunt.task.run('tinyimg');
        }
    });

    // register modernizr task
    grunt.registerTask('modernizrcust', 'The custom task for modernizr', function () {
        // Check if files set
        var rawConfig = grunt.config.getRaw();
        if (typeof rawConfig.project.modernizrOptions !== 'undefined') {
            grunt.task.run('modernizr');
        }
    });

    // register convertimg task
    grunt.registerTask('convertimg', 'The custom task for convertimg', function () {
        // Check if files set
        var rawConfig = grunt.config.getRaw();
        if (typeof rawConfig.project.convertingImages !== 'undefined') {
            grunt.task.run('cwebp');
            grunt.task.run('command_run:convert_to_jp2');
            grunt.task.run('command_run:convert_to_jxr');
        }
    });

};