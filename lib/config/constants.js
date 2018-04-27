module.exports = {
    version: '1.0.0',
    fs: {
        // name starting from . will be hidden on linux based machines
        // TODO: Fina out a graceful way to make it hidden on windows as well
        // ULGY WAY: https://stackoverflow.com/questions/22053335/node-js-create-hidden-directory-windows
        directory: '.codin_temp',
        json: 'report.json',
        compressed: 'report.json.gz',
        creadentials: '.credentials',
    },
    server: {
        base: 'http://172.29.182.243:3000/v1/',
        apis: {
            upload: 'project/upload',
            register: 'project/register',
            login: 'user/login',
        },
    },
};
