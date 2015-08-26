module.exports = function (grunt) {
// Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        local: grunt.file.readJSON('local.json'),
        env: grunt.file.readJSON('../config/' + grunt.option('env') + '-env.json'),
        project: grunt.file.readJSON('../config/' + grunt.option('project') + '.json'),
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
                options: {
                    username: "<%= project.remoteUsername %>",
                    host: "<%= project.remoteHost %>",
                    port: "<%= project.remotePort %>",
                    privateKey: "<%= grunt.file.read(env.privateKeyPath) %>"
                }
            }
        },
        shell: {
            local: {
                command: "<%= project.shellLocalCommand %>",
            },
            rsync: {
                command: "<%= project.shellRsyncCommand %>",
            },
        }
    };

    grunt.initConfig(config);


// Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble-less');
    
    // Task definition
    grunt.registerTask('build', ['imagemin', 'less', 'concat', 'uglify', 'copy']);
    grunt.registerTask('deploy:shell', ['clean:before', 'newer:less', 'concat', 'uglify', 'newer:copy', 'rsync', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:dev', ['clean:before', 'newer:less', 'concat', 'uglify', 'newer:copy', 'clean:after', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:dev-shell', ['newer:less', 'concat', 'uglify', 'newer:copy', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:js', ['concat', 'uglify', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:js-shell', ['concat', 'uglify', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:dev-full', ['clean:before', 'autospritesmith', 'newer:imagemin', 'newer:less', 'concat', 'uglify', 'newer:copy', 'clean:after', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:dev-full-shell', ['clean:before', 'autospritesmith', 'newer:imagemin', 'newer:less', 'concat', 'uglify', 'newer:copy', 'clean:after', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:skin', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:less', ['newer:less', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:less-shell', ['newer:less', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:global', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:global-shell', ['shell:local', 'sshexec']);

};