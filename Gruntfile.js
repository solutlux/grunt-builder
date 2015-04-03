module.exports = function (grunt) {
// Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        project: grunt.file.readJSON(grunt.option('project')+'.json'),
        less: {
            dev: {
                options: {
                    paths: ["<%= project.path %>"],
                    sourceMap: true
                    //compress: true,
                },
                files: {
                    "<%= project.cssFile %>": "<%= project.lessFile %>"
                }
            },
            prod: {
                options: {
                    paths: ["<%= project.path %>"],
                    //sourceMap: true,
                    compress: true
                },
                files: {
                    "<%= project.compressedFile %>": "<%= project.lessFile %>"
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ["<%= project.fontsFile %>"], dest: "<%= project.fontsCopy %>", filter: 'isFile'}
               ]
            }
        }
    };
    
    grunt.initConfig(config); 
    
    
// Plugin loading
    // grunt.loadNpmTasks('grunt-typescript');
    // grunt.loadNpmTasks('grunt-concat-sourcemap');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    // grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-prompt');
    // Task definition
    // grunt.registerTask('build', ['less', 'typescript', 'copy', 'concat_sourcemap', 'uglify']);
    // grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', ['less', 'copy']);
};