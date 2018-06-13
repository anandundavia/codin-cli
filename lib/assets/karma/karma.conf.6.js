const path = require('path');
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = (config) => {
    // We are editing the path to require such that the 'require'
    // function considers the plugin path of the cwd
    const nodeModules = path.join(process.cwd(), 'node_modules', path.sep);
    config.set({
        listenAddress: '127.0.0.1',
        hostname: '127.0.0.1',
        basePath: '', // TODO: Should we sync this path with the user's karma conf?
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            /* eslint-disable global-require, import/no-unresolved, import/no-dynamic-require */
            require(`${nodeModules}karma-jasmine`),
            require(`${nodeModules}karma-chrome-launcher`),
            require(`${nodeModules}karma-jasmine-html-reporter`),
            require(`${nodeModules}karma-coverage-istanbul-reporter`),
            require(`${nodeModules}@angular-devkit/build-angular/plugins/karma`),
            /* eslint-enable global-require, import/no-unresolved */
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        coverageIstanbulReporter: {
            reports: ['html', 'lcovonly', 'json', 'json-summary'],
            fixWebpackSourcePaths: true,
        },
        angularCli: {
            environment: 'dev',
        },
        reporters: ['progress', 'kjhtml', 'coverage-istanbul'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true, // We do not want to watch for file changes
        browsers: ['ChromeHeadless'],
        singleRun: true, // Once the tests are finished, close the browser
    });
};
