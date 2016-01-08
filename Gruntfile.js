grunt.initConfig({
  removelogging: {
    dist: {
      src: ["client/**/*.js", "server/**/*.js"]
    }
  }
});

grunt.loadNpmTasks("grunt-remove-logging");
