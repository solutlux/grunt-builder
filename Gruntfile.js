module.exports = function (grunt) {
    // Project configuration.
    
    var envJSON = grunt.file.readJSON('../config/' + grunt.option('env') + '-env.json');
    var projectJSON = grunt.file.readJSON('../config/' + grunt.option('project') + '.json');
    
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
            /*only_nat: {
                "expand": true,
                "cwd": "../views/themes/naturacel/naturacel/less",
                "src": [
                    "style.less",
                    "home.less",
                    "how-it-works.less"
                ],
                "dest": "../public_html/wp-content/themes/naturacel/css/",
                "ext": ".css"
            },*/
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
            },
            only_nat: {
                "expand": true,
                "cwd": "../views/themes/naturacel/naturacel",
                "src": [
                    "{images,sprites}/**/*.{png,jpg,gif}",
                    "!sprites/*-sprite/**"
                ],
                "dest": "../public_html/wp-content/themes/naturacel/"
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
        },
        runner: projectJSON.runnerTaskList
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
    grunt.registerTask('deploy:dev-shell', ['newer:less', 'concat', 'newer:copy', 'uglify', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:js', ['concat', 'uglify', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:js-shell', ['concat', 'uglify', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:dev-full', ['clean:before', 'autospritesmith', 'newer:imagemin', 'newer:less', 'concat', 'newer:copy', 'uglify', 'clean:after', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:dev-full-shell', ['clean:before', 'autospritesmith', 'newer:imagemin', 'newer:less', 'concat', 'newer:copy', 'uglify', 'clean:after', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:skin', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:less', ['newer:less', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:less-shell', ['newer:less', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:global', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:global-shell', ['shell:local', 'sshexec']);

    grunt.registerMultiTask('runner', 'Log stuff.', function () {
        config.project = grunt.file.readJSON('../config/' + this.data.project + '.json');
        config.env = grunt.file.readJSON('../config/' + this.data.env + '-env.json');
        grunt.initConfig(config);
        grunt.task.run(this.data.task);
    });
};