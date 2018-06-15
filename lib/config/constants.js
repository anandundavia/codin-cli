module.exports = {
    version: '1.0.0',
    fs: {
        // name starting from . will be hidden on linux based machines
        // TODO: Find out a graceful way to make it hidden on windows as well
        // UGLY WAY: https://stackoverflow.com/questions/22053335/node-js-create-hidden-directory-windows
        directory: '.codin',

        // All the configuration files
        config: '.config',
        info: '.info',

        // All the json files that contains the reports
        tslintRules: 'rule.json',
        lint: 'lint.json',
        summary: 'summary.json',
        quality: 'quality.json',

        // Files for coverage
        coverage: 'coverage.json',
        coverageSummary: 'coverage-summary.json',
        coverageFinal: 'coverage-final.json',

        // If you change this, Make sure to change the back-end according to this name
        compressed: 'upload.tar.gz',

        // Output of tsc in case of Angular project
        compiled: 'compiled',

        // Credentials which will be used to login to backend
        credentials: '.codin_credentials',
    },
    server: {
        // set it to falsy to not use proxy
        proxy: null,
        base: 'http://codin-backend.qbbvxnf82n.us-east-1.elasticbeanstalk.com/v1/',
        apis: {
            upload: 'report/upload',
            register: 'project/register',
            login: 'user/login',
            projectList: 'user/project',
        },
    },

    projects: {
        angular: {
            // Angular specific configs
        },
        react: {
            // React specific configs
        },
        get list() {
            return Object.keys(this).filter(x => x !== 'list');
        },
    },

    test: {
        karma: { // Should we have version specific commands?
            coverage: '--code-coverage',
            // File names which will have coverage reports
            files: ['coverage-summary.json', 'coverage-final.json'],
            angular: {
                default: {
                    configCommand: '--config',
                    configFile: 'karma.conf.default.js',
                },
                6: {
                    configCommand: '--karma-config',
                    configFile: 'karma.conf.6.js',
                },
            },
        },
        get list() {
            return Object.keys(this).filter(x => x !== 'list');
        },
    },

    get spinner() {
        const isWin = process.platform === 'win32';
        if (isWin) {
            return {
                interval: 80,
                frames: ['[   ]', '[=  ]', '[== ]', '[ ==]', '[  =]', '[   ]', '[  =]', '[ ==]', '[== ]', '[=  ]'],
            };
        }
        return {
            interval: 80,
            frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
        };
    },
};
