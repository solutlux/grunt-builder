module.exports = function (grunt) {
// Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        key: grunt.file.readJSON('key.json'),
        project: grunt.file.readJSON(grunt.option('project')+'.json'),
        less: {
            prod: {
                options: {
                    paths: ["<%= project.path %>"],
                    sourceMap: "<%= project.cssSitemap %>",
                    compress: true
                },
                files: "<%= project.lessFiles %>"
            }
        },
        concat: {
            dev: {
                files: "<%= project.concatFiles %>",
                options : {
                    sourceMap: true
                }    
            },
        },
        uglify: {
            prod: {
                files: [{
                    expand: true,
                    cwd: "<%= project.jsFolder %>",
                    src: '**/*.js',
                    dest: "<%= project.jsFolder %>",
                    ext: ".min.js"
                }]
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true, 
                        flatten: true, 
                        src: ["<%= project.fontsFile %>"], 
                        dest: "<%= project.fontsCopy %>", 
                        filter: 'isFile'
                    }
               ]
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
                include: "<%= project.rsyncInclude %>",
                recursive: true
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
                    privateKey: "<%= grunt.file.read(key.privateKeyPath) %>"
                }
            }
        },
        shell: {
            local: {
                command: "<%= project.shellLocalCommand %>",
            },
        }
    };
    
    grunt.initConfig(config); 
    
    
// Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('assemble-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-shell');

    // Task definition
    grunt.registerTask('build', ['less', 'copy']);
    grunt.registerTask('deploy:shell', ['less', 'concat', 'copy', 'uglify', 'rsync', 'shell:local', 'sshexec']);
    grunt.registerTask('deploy:dev', ['less', 'concat', 'copy', 'uglify', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:skin', ['rsync', 'sshexec']);
    grunt.registerTask('deploy:less', ['less', 'rsync', 'sshexec']);
    grunt.registerTask('deploy:global', ['rsync', 'sshexec']);
    
};