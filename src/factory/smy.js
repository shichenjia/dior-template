import Vue from "vue";
import gcoord from "gcoord";
const baseFactory = require("./base.js");

let recorder = null,
    appId = "",
    appSecret = "";

export class smyFactory extends baseFactory {
    constructor() {
        super();
        this.loadScript();
    }
    loadScript() {
        if (typeof window.eshimin !== "undefined") {
            return;
        }
        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = "https://api.eshimin.com/api/js/eshiminJS-2.0.0.js";

        document.getElementsByTagName("head")[0].appendChild(script);
    }
    login(params) {
        return new Promise((resolve) => {
            appId = params.invokeAppId;
            appSecret = params.invokeAppSecret;
            resolve(sessionStorage.getItem("phone"));
        });
    }
    initSDK(isComponent) {
        let api = Vue.prototype.$apiFactory;

        return new Promise((resolve, reject) => {
            api.getSMYInvokeToken({
                "clientId": appId,
                "clientSecret": appSecret
            }, isComponent).then((res) => {
                //微信js-skd 初始化
                window.eshimin.config({
                    "debug": true, //开启调试模式，调试模式下会输出部分便于定位问题的 log。发布时注意
                    "signature": res, //唯一令牌
                    "jsApiList": ["getLocation", "chooseImage", "startRecordByRequest", "translateVoiceByRequest"] //需要使⽤的接⼝列表，必须先申请之后
                });
                window.eshimin.ready(function () {
                    //配置注⼊成功，校验通过
                    resolve();
                });
                window.eshimin.error(function (message) {
                    //失败，配置校验不通过
                    reject(message);
                });
            }, () => {
                reject();
            });
        });
    }
    getRecorderPermission() { //获取权限
        return new Promise((resolve, reject) => {
            reject("");
        });
    }
    initRecorder() {
        return new Promise((resolve, reject) => {
            try {
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    startRecorder() { //开启录音
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.startRecord();
                resolve();

            }, (err) => {
                reject(err);
            });
        });
    }
    pauseRecorder() { //暂停录音
        return new Promise((resolve, reject) => {
            try {
                recorder.pause();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    resumeRecorder() { //继续录音
        return new Promise((resolve, reject) => {
            try {
                recorder.resume();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    stopRecorder() { //结束录音
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.stopRecord({
                    "success": function (res) {
                        resolve(res.localId);
                    }
                });
            }, (err) => {
                reject(err);
            });
        });
    }
    destroyRecorder() { //销毁录音重新录制
        return new Promise((resolve, reject) => {
            try {
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    playRecorder(localId) { //播放录音
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.playVoice({
                    localId
                });
                resolve(localId);
            }, (err) => {
                reject(err);
            });
        });
    }
    pausePlay(localId) { //暂停录音播放
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.pauseVoice({
                    localId
                });
                resolve(localId);
            }, (err) => {
                reject(err);
            });
        });
    }
    resumePlay(localId) { //恢复录音播放
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.playVoice({
                    localId
                });
                resolve(localId);
            }, (err) => {
                reject(err);
            });
        });
    }
    stopPlay(localId) { //停止录音播放
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.stopVoice({
                    localId
                });
                resolve(localId);
            }, (err) => {
                reject(err);
            });
        });
    }
    getRecorderFile(localId) { //录音结束后 获取WAV数据 后续统一为base64
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                wx.uploadVoice({
                    "localId": localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                    "isShowProgressTips": 1, // 默认为1，显示进度提示
                    "success": function (res) {
                        // var serverId = res.serverId; // 返回音频的服务器端ID
                        resolve(res.serverId);
                    }
                });
            }, (err) => {
                reject(err);
            });
        });
    }
    getAddressByLonLat(coord) {
        return new Promise((resolve, reject) => {
            const myGeo = new BMap.Geocoder(),
                latitude = coord.lat, // 纬度，浮点数，范围为90 ~ -90
                longitude = coord.lon,
                point = new BMap.Point(longitude, latitude);

            myGeo.getLocation(point, function (result) {
                if (result) {
                    resolve(result.addressComponents);
                } else {
                    reject("获取地址信息失败！");
                }
            });

        });
    }
    getCoordByAddress(address) {
        return new Promise((resolve, reject) => {
            const myGeo = new BMap.Geocoder();

            myGeo.getPoint(address, function (point) {
                if (point) {
                    let {
                        lng,
                        lat
                    } = point;

                    resolve({
                        lat,
                        lng
                    });
                } else {
                    reject("您选择的地址没有解析到结果！");
                }
            }, "上海市");
        });
    }
    transformLocation(longitude, latitude, translateCallback) {
        var ggPoint = new BMap.Point(longitude, latitude),
            convertor = new BMap.Convertor(),
            pointArr = [];

        pointArr.push(ggPoint);
        convertor.translate(pointArr, COORDINATES_WGS84, COORDINATES_BD09, translateCallback);
    }
    getLocation(params) { //获取定位
        console.log(params);

        return new Promise((resolve, reject) => {
            try {
                this.initSDK().then(() => {
                    window.eshimin.invoke("getLocation", {
                        "timeout": 5,
                        "accuracy": 5,
                        "requireAddress": false,
                        "allowLastKnown": 30
                    }, function (res) {
                        if (res.errorCode === 0) {
                            let latitude = res.latitude, // 纬度，浮点数，范围为90 ~ -90
                                longitude = res.longitude,
                                result = gcoord.transform(
                                    [longitude, latitude], // 经纬度坐标
                                    gcoord.GCJ02, // 当前坐标系
                                    gcoord.WGS84// 目标坐标系
                                ),
                                json = {
                                    "longitudeWgs84": result[0],
                                    "latitudeWgs84": result[1],
                                    "longitudeGcj02": longitude,
                                    "latitudeGcj02": latitude
                                };

                            resolve(json);
                        } else {
                            reject(res.errorMessage);
                        }

                    });

                }, (err) => {
                    reject(err);
                });
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    getLocationAutoLBS() { //持续获取LBS信息
        return new Promise((resolve, reject) => {
            try {
                resolve();
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    stopLocationAutoLBS() { //持续获取LBS信息
        return new Promise((resolve, reject) => {
            try {
                //init SDK
                resolve();
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    closeWindow() {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                wx.closeWindow();
                resolve();
            }, () => {
                reject();
            });
        });
    }
    count = 0
    type = ""
    chooseImage(count, type) {
        return new Promise((resolve) => {
            this.count = count;
            this.type = type;
            resolve();
        });
    }
    getLocalImgData() {
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                window.eshimin.invoke("chooseImage", {
                    "sourceTypes": [this.type]
                }, function (response) {
                    if (response.errorCode === 0) {
                        resolve(`data:image/png;base64,${response.imageData}`);
                    } else {
                        reject(response.errorMessage);

                    }
                });
            });
        });
    }
    chooseVideo() {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                wx.invoke("chooseVideo", {
                    "sourceType": ["camera"] // 可以指定来源是相册还是相机，默认二者都有
                }, function (res) {
                    const localIds = typeof res.localIds === "object" ? res.localIds : JSON.parse(res.localIds);

                    resolve(localIds[0]);
                });
            }, () => {
                reject();
            });
        });
    }
    uploadVideo(localId) {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                wx.invoke("uploadVideo", {
                    localId, // 需要上传的视频的本地ID，由chooseVideo接口获得
                    "isShowProgressTips": 1 // 默认为1，显示进度提示
                }, function (res) {
                    resolve(res.serverId);
                });
            }, () => {
                reject();
            });
        });
    }
    scanQRCode() {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                wx.scanQRCode({
                    "desc": "scanQRCode desc",
                    "needResult": 1, // 默认为0，扫描结果由政务微信处理，1则直接返回扫描结果，
                    "scanType": ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                    "success": function (res) {
                        resolve(res.resultStr);
                    },
                    "error": function (res) {
                        if (res.errMsg.indexOf("function_not_exist") > 0) {
                            reject("版本过低请升级");
                        }
                    }
                });
            });
        });
    }
    startVoiceTranslate() {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.eshimin.invoke("startRecordByRequest", null, function (response) {
                    if (response.errorCode === 0) {
                        resolve();
                    } else {
                        reject(response.errorMessage);

                    }
                });
            });
        });
    }
    translateVoice() {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.eshimin.invoke("translateVoiceByRequest", null, function (response) {
                    if (response.errorCode === 0) {
                        resolve(response.data);
                    } else {
                        reject(response.errorMessage);
                    }
                });
            });
        });
    }
}