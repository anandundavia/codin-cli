const ora = require('ora');

const Loading = function Loading() {
    let instance;
    this.showLoading = () => {
        instance = ora().start();
    };

    this.hideLoading = () => {
        instance.succeed();
    };
};

module.exports = new Loading();
