module.exports = function (grunt) {
    // Project configuration.

    var envJSON = grunt.file.readJSON('../config/' + grunt.option('env') + '-env.json');
    var projectJSON = grunt.file.readJSON('../config/' + grunt.option('project') + '.json');
    
    function cloneConfig() {
        var config = {
            pkg: grunt.file.readJSON('package.json'),
            local: grunt.file.readJSON('local.json'),
            env: envJSON,
            project: projectJSON,
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
                    privateKey: "<%= grunt.file.read(env.privateKeyPath) %>"
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
        }
        
        if (projectJSON.runnerTaskList && Object.keys(projectJSON.runnerTaskList).length)
            config.runner = projectJSON.runnerTaskList;
        else
            config.runner = { none: {} };
        
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
        
        // set new configuration
        var config = cloneConfig();
        var configOriginal = {};
        
        // set specific configuration
        if (this.data.project) {
            this.data.project = grunt.file.readJSON('../config/' + this.data.project + '.json');
        }
        
        
        if (this.data.env) {
            this.data.env = grunt.file.readJSON('../config/' + this.data.env + '-env.json');
        }
        
        if (this.data.docRootPath) {
            this.data.env.docRootPath = this.data.docRootPath;
        }
        
        var configRestore = false;
        // replace original configuration
        for (var field in this.data) {
            if (config[field]) {
                configRestore = true;
                configOriginal[field] = config[field];
            }
            config[field] = this.data[field];
        }
        
        // create new config
        grunt.initConfig(config);
        
        // run task with new configuration
        grunt.task.run(this.data.task);
       
       
        for (var field in configOriginal) {
            config[field] = configOriginal[field];
        }
        
        //if (configOriginal)
        //grunt.config.set('project', currentProject);
        
        console.log(grunt.config);
                
    });
};