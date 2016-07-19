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

    // Task definition
    grunt.registerTask('js', ['concat', 'uglify']);
    grunt.registerTask('build-full', ['clean:before', 'autospritesmith', 'build', 'clean:after']);
    grunt.registerTask('build', ['imagemin', 'tinyimg', 'less', 'concat', 'uglify', 'copy']);

    grunt.registerTask('deploy:copyless', ['less', 'copy', 'deploy:global']);

    grunt.registerTask('deploy:shell', ['clean:before', 'less', 'concat', 'uglify', 'copy', 'rsync', 'deploy:global']);
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

};
