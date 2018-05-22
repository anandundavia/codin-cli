const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const ora = require('ora');

const constants = require('../../config/constants');
const cookie = require('./cookie.service');

const spinner = ora('Please wait...');
const messages = [
    'Talking to backend...',
    'Consuming delicious APIs...',
    'Almost there...',
];

const Server = function server() {
    const _startSpinner = () => {
        const index = Number.parseInt((Math.random() * 100) % messages.length, 10);
        spinner.text = messages[index];
        spinner.start();
    };

    this.login = (email, password) => new Promise((resolve, reject) => {
        _startSpinner();
        const url = `${constants.server.base}${constants.server.apis.login}`;
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        }).then(async (response) => {
            if (response.status === 200) {
                cookie.set(response.headers.get('set-cookie'));
                const json = await response.json();
                return json;
            }
            const text = await response.text();
            throw text;
        }).catch((err) => {
            spinner.stop(); reject(err);
        }).then((data) => {
            spinner.stop(); resolve(data);
        });
    });

    this.upload = (file, projectID) => new Promise(async (resolve, reject) => {
        _startSpinner();
        const url = `${constants.server.base}${constants.server.apis.upload}/${projectID}`;
        const body = new FormData();
        body.append('report', fs.createReadStream(file));
        fetch(url, {
            method: 'POST',
            headers: { cookie: cookie.get() },
            body,
        }).then(async (response) => {
            const json = await response.json();
            if (response.status === 200) {
                return json;
            }
            throw json;
        }).catch((err) => {
            spinner.stop(); reject(err);
        }).then((data) => {
            spinner.stop(); resolve(data);
        });
    });

    this.register = body => new Promise(async (resolve, reject) => {
        _startSpinner();
        const url = `${constants.server.base}${constants.server.apis.register}`;
        const auth = cookie.get();
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', cookie: auth },
            body: JSON.stringify(body),
        }).then(async (response) => {
            const json = await response.json();
            if (response.status === 200) {
                return json;
            }
            throw json;
        }).catch((err) => {
            spinner.stop(); reject(err);
        }).then((data) => {
            spinner.stop(); resolve(data);
        });
    });

    this.projectList = () => new Promise(async (resolve, reject) => {
        _startSpinner();
        const url = `${constants.server.base}${constants.server.apis.projectList}`;
        const auth = cookie.get();
        fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', cookie: auth },
        }).then(async (response) => {
            const json = await response.json();
            if (response.status === 200) {
                return json;
            }
            throw json;
        }).catch((err) => {
            spinner.stop(); reject(err);
        }).then((data) => {
            spinner.stop(); resolve(data);
        });
    });
};

module.exports = new Server();
