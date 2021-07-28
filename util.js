module.exports = {
    getCookie: (Cookie, name) => {
        let cookie = {};
        Cookie.split(';').forEach(function (el) {
            let [k, v] = el.split('=');
            cookie[k.trim()] = v;
        });
        return cookie[name];
    },
};
