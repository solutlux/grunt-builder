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
                    sourceMap: true
                }
            },
        },
        uglify: {
            options: {
                mangle: "<%= project.uglifyMangle %>"
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
            scripts: {
                files: "<%= project.watchFiles %>",
                tasks: "<%= project.watchTasks %>",
            },
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
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-autospritesmith');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    //grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-newer');

    // Task definition
    grunt.registerTask('build', ['imagemin', 'less', 'concat', 'copy', 'uglify']);
    grunt.registerTask('deploy:shell', ['clean:before', 'newer:less', 'concat', 'newer:copy', 'uglify', 'rsync', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:dev', ['clean:before', 'newer:less', 'concat', 'newer:copy', 'uglify', 'clean:after', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:js', ['concat', 'uglify', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:dev-full', ['clean:before', 'autospritesmith', 'newer:imagemin', 'newer:less', 'concat', 'newer:copy', 'uglify', 'clean:after', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:dev-shell', ['newer:less', 'concat', 'newer:copy', 'uglify', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:skin', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:less', ['less', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:less-shell', ['less', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:global', ['rsync', 'sshexec']);

};