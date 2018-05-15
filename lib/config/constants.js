module.exports = {
    version: '1.0.0',
    fs: {
        // name starting from . will be hidden on linux based machines
        // TODO: Find out a graceful way to make it hidden on windows as well
        // UGLY WAY: https://stackoverflow.com/questions/22053335/node-js-create-hidden-directory-windows
        directory: '.codin',
        json: 'report.json',
        summary: 'summary.json',
        // If you change this, Make sure to change the back-end according to this name
        compressed: 'upload.tar.gz',
        credentials: '.codin_credentials',
        config: '.config',
        rule: 'rule.json',
    },
    server: {
        base: 'http://localhost:3000/v1/',
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

};
