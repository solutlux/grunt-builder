module.exports = function (grunt) {
    // Project configuration.

    function cloneConfig() {
        
        var config = {
            pkg: grunt.file.readJSON('package.json'),
            local: grunt.file.readJSON('local.json'),
            envt: grunt.file.readJSON('../config/' + grunt.option('envt') + '-env.json'),
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
            rsync: {
                options: {
                    args: "<%= project.rsyncArgs %>",
                    exclude: "<%= project.rsyncExclude %>",
                    include: "<%= project.rsyncInclude %>"
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
                    minimumFiles: 1
                },
                target: {
                    options: {
                        log: true,
                        task: ["shell:local"],
                        gruntOptions: {
                            envt: "kupizamok",
                            project: "core.merkalt"
                        }
                    },
                    src: ["Gruntfile.js"]
                },
            },
        }
        
        if (config.project.runnerTaskList && Object.keys(config.project.runnerTaskList).length) {
            config.runner = config.project.runnerTaskList;
        } else {
            config.runner = { none: {} };
        }
        
        return config;
    }
    
    grunt.initConfig(cloneConfig());
    
    // Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble-less');
    
    // Task definition
    grunt.registerTask('build-full', ['clean:before', 'runner', 'autospritesmith', 'newer:tinyimg', 'newer:imagemin', 'newer:less', 'concat', 'uglify', 'newer:copy', 'clean:after']);
    grunt.registerTask('build', ['imagemin', 'tinyimg', 'less', 'concat', 'uglify', 'copy']);
    
    grunt.registerTask('copyless', ['less', 'copy', 'shell:local', 'sshexec:prod']);
    
    grunt.registerTask('deploy:shell', ['clean:before', 'newer:less', 'concat', 'uglify', 'newer:copy', 'rsync', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:build-full', ['build-full', 'rsync', 'sshexec:prod']);
    grunt.registerTask('deploy:dev-shell', ['newer:less', 'concat', 'uglify', 'newer:copy', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:js', ['concat', 'uglify', 'rsync', 'sshexec:prod']);
    grunt.registerTask('deploy:js-shell', ['concat', 'uglify', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:dev-full', ['build-full', 'rsync', 'sshexec:prod']);
    grunt.registerTask('deploy:dev-full-shell', ['build-full', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:skin', ['rsync', 'sshexec:prod']);
    grunt.registerTask('deploy:less', ['newer:less', 'rsync', 'sshexec:prod']);
    grunt.registerTask('deploy:less-shell', ['newer:less', 'shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:global', ['rsync', 'sshexec:prod']);
    grunt.registerTask('deploy:global-shell', ['shell:local', 'sshexec:prod']);
    grunt.registerTask('deploy:runner', ['runner', 'deploy:global']);

    grunt.registerMultiTask('runner', 'Launch tasks for various projects', function () {
        if (!this.data.task) {
            console.log('Task not found');
            return;
        }
        
        //console.log(process.env);
        
        var cb = this.async();
        var child = grunt.util.spawn({
            grunt: true,
            args: [this.data.task, '--envt=kupizamok', '--project=core.merkalt', '-v'],
            opts: {
            }
        }, function(error, result, code) {
            cb();
        });

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        
        /*
        // set new configuration
        var config = cloneConfig();
        var configOriginal = {};
        
       
        
        
        if (this.data.envt) {
            this.data.envt = grunt.file.readJSON('../config/' + this.data.envt + '-env.json');
        }
        
        var configRestore = false;
        // replace original configuration
        for (var field in this.data) {
            if (config[field]) {
                configRestore = true;
                configOriginal[field] = config[field];
            }
            //config[field] = this.data[field];
        }
        
        // create new config
        //grunt.initConfig(config);
        
        // run task with new configuration
        //grunt.task.run(this.data.task);
        
        //console.log(configOriginal);
       
        for (var field in configOriginal) {
            //grunt.config.data[field] = configOriginal[field];
        }
        
        //if (configOriginal)
        //grunt.config.set('project', currentProject);
        
        //console.log(grunt.config.data.project);
            */    
    });
};