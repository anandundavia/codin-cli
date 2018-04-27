const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const constants = require('../../config/constants');
const cookie = require('./cookie.service');

const Server = function server() {
    this.isLoggedIn = () => new Promise(async (resolve, reject) => {
        try {
            const auth = await cookie.get();
            resolve(auth);
        } catch (e) {
            reject(e);
        }
    });

    this.login = (email, password) => new Promise((resolve, reject) => {
        const url = `${constants.server.base}${constants.server.apis.login}`;
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        }).then(async (response) => {
            if (response.status === 200) {
                await cookie.set(response.headers.get('set-cookie'));
                const json = await response.json();
                return json;
            }
            const text = await response.text();
            throw text;
        }).catch(reject).then(resolve);
    });

    this.upload = file => new Promise(async (resolve, reject) => {
        const url = `${constants.server.base}${constants.server.apis.upload}`;
        const auth = await cookie.get();
        const body = new FormData();
        body.append('report', fs.createReadStream(file));
        fetch(url, {
            method: 'POST',
            headers: { cookie: auth },
            body,
        }).then(async (response) => {
            const json = await response.json();
            if (response.status === 200) {
                return json;
            }
            throw json;
        }).catch(reject).then(resolve);
    });

    this.register = project => new Promise(async (resolve, reject) => {
        const url = `${constants.server.base}${constants.server.apis.register}`;
        const auth = await cookie.get();
        const body = { name: project };
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
        }).catch(reject).then(resolve);
    });
};

module.exports = new Server();
