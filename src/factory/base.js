class baseFactory {
    constructor() {}
    /**
     * 接入第三方平台 获取用户
     * @param {String} phone 用户手机号  唯一值
   */
    login(params) {
        return new Promise((resolve) => {
            resolve(params.userId);
        });
    }
    getPermission(){
        return new Promise((resolve, reject) => {
            resolve();
            reject();
        });
    }
    startRecorder(){
        return new Promise((resolve, reject) => {
            resolve();
            reject();
        });
    }
}
module.exports = baseFactory;
