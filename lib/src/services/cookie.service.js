const Cookie = function Cookie() {
    let theCookie;
    this.set = (cookie) => {
        theCookie = cookie;
    };
    this.get = () => theCookie;
};

module.exports = new Cookie();
