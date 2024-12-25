// import wx from "weixin-js-sdk"; lamejs = require("lamejs")
// import Recorder from "js-audio-recorder";
import Vue from "vue";
import gcoord from "gcoord";
const baseFactory = require("./base.js");

let recorder = null,
    appId = "",
    agentId="",
    appSecret = "",
    zwAppSecret="";

export class ssbFactory extends baseFactory {
    constructor() {
        super();
        this.loadScript();
    }
    loadScript() {
        if (typeof window.wx !== "undefined") {
            return;
        }
        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = "https://res.wx.qq.com/open/js/jweixin-1.3.2.js";
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    login(params) {
        if (params.isZw === "1") {
            return new Promise((resolve, reject) => {
                let api = Vue.prototype.$apiFactory,
                    message = "";

                appId = params.zwAppId;
                agentId = params.zwAgentId;
                zwAppSecret = appSecret = params.zwAppSecret;

                console.log("zwAppId:"+params.zwAppId);
                console.log("zwAgentId:"+params.zwAgentId);
                console.log("zwAppSecret:"+params.zwAppSecret);

                api.getZWUser(params).then(res => {
                    if (params.hasWorkPhoneChoice) {
                        resolve(res);
                    } else {
                        resolve(res.mobile); //用户登入成功
                    }
                }, (err) => {
                    console.log(err);
                    message = "根据code获取用户失败!";
                    reject(message);
                });
            });
        }

        return new Promise((resolve) => {
            appId= params.zwAppId;
            agentId = params.zwAgentId;
            zwAppSecret = appSecret = params.zwAppSecret;
            resolve(sessionStorage.getItem("phone"));
        });
    }
    initSDK(isComponent) {
        let api = Vue.prototype.$apiFactory;

        return new Promise((resolve, reject) => {
            if (sessionStorage.getItem("isSSb")) {
                api.getAuthSign().then(res => {
                    window.wx.config({
                        "beta": true, // 调用window.wx.invoke形式的接口值时，该值必须为true。
                        "debug": false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        "appId": res.data.appId,
                        "timestamp": Number(res.data.timestamp),
                        "nonceStr": res.data.nonceStr,
                        "signature": res.data.signature,
                        "jsApiList": [
                            "checkJsApi",
                            "translateVoice",
                            "startRecord",
                            "agentConfig",
                            "stopRecord",
                            "onVoiceRecordEnd",
                            "playVoice",
                            "onVoicePlayEnd",
                            "startRecordVoiceBuffer",
                            "onRecordBufferReceived",
                            "stopRecordVoiceBuffer",
                            "pauseVoice",
                            "stopVoice",
                            "uploadVoice",
                            "downloadVoice",
                            "getLocalImgData",
                            "chooseImage",
                            "previewImage",
                            "uploadImage",
                            "downloadImage",
                            "getNetworkType",
                            "openLocation",
                            "getLocation",
                            "closeWindow",
                            "scanQRCode",
                            "uploadVideo"
                        ]
                    });
                    window.wx.ready(() => {
                        resolve();
                    });


                }).catch(() => {
                    reject();
                });
            } else {
                console.log("getWXConfigZW", zwAppSecret);
                // eslint-disable-next-line no-param-reassign
                api.getWXConfigZW(zwAppSecret,isComponent).then((res) => {
                    console.log(res);
                    window.wx.config({
                        "beta": true, // 调用window.wx.invoke形式的接口值时，该值必须为true。
                        "debug": false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        "appId": appId,
                        "timestamp": res.timestamp,
                        "nonceStr": res.noncestr || res.nonceStr,
                        "signature": res.signature,
                        "jsApiList": [
                            "checkJsApi",
                            "agentConfig",
                            "translateVoice",
                            "startRecord",
                            "stopRecord",
                            "onVoiceRecordEnd",
                            "playVoice",
                            "onVoicePlayEnd",
                            "startRecordVoiceBuffer",
                            "onRecordBufferReceived",
                            "stopRecordVoiceBuffer",
                            "pauseVoice",
                            "stopVoice",
                            "uploadVoice",
                            "downloadVoice",
                            "chooseImage",
                            "previewImage",
                            "uploadImage",
                            "downloadImage",
                            "getLocalImgData",
                            "getNetworkType",
                            "openLocation",
                            "getLocation",
                            "closeWindow",
                            "scanQRCode",
                            "uploadVideo"
                        ]
                    });
                    window.wx.ready(() => {
                        resolve();
                    });
                }, () => {
                    reject();
                });
            }

        });
    }
    initAgentConfig(isComponent) {
        let api = Vue.prototype.$apiFactory;

        return new Promise((resolve, reject) => {
            if (sessionStorage.getItem("isSSb")) {
                api.getAuthSign().then(res => {
                    window.wx.invoke("agentConfig", {
                        "agentid": agentId, // 必填，单位应用的agentid
                        "corpid": res.data.appId, // 必填，政务微信的corpid
                        "timestamp":Number( res.data.timestamp),// 必填，生成签名的时间戳,int类型, 如 1539100800
                        "nonceStr": res.data.nonceStr,// 必填，生成签名的随机串
                        "signature": res.data.signature// 必填，签名，见附录5
                    }, function(ress) {
                        if(ress.err_msg !== "agentConfig:ok"){
                            reject();
                        }
                        resolve();
                    });
                }).catch(() => {
                    reject();
                });
            } else{
                api.getAgentConfigZW(appSecret,isComponent).then((res) => {
                    console.log("=======getAgentConfig========");
                    console.log("agentId:"+agentId);
                    console.log("corpid:"+appId);
                    console.log("timestamp:"+res.timestamp);
                    console.log("nonceStr:"+res.noncestr);
                    console.log("signature:"+res.signature);
                    console.log(res);
                    window.wx.invoke("agentConfig", {
                        "agentid": agentId, // 必填，单位应用的agentid
                        "corpid": appId, // 必填，政务微信的corpid
                        "timestamp":parseInt(res.timestamp),// 必填，生成签名的时间戳,int类型, 如 1539100800
                        "nonceStr": res.noncestr,// 必填，生成签名的随机串
                        "signature": res.signature// 必填，签名，见附录5
                    }, function(ress) {
                        console.log(ress);
                        console.log("=======getAgentConfig========");
                        if(ress.err_msg !== "agentConfig:ok"){
                            reject();
                        }
                        resolve();

                    //这里可以调用用户数据接口
                    });
                }, () => {
                    reject();
                });
            }
        });
    }
    getRecorderPermission() { //获取权限
        return new Promise((resolve, reject) => {
            try{
                resolve();
            } catch(ex){
                reject(ex);
            }
            // Recorder.getPermission().then(() => {
            //     resolve("recorder is permission");
            // }, (error) => {
            //     reject("无录音权限:" + error);
            // });
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
                window.wx.startRecord();
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
                window.wx.stopRecord({
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
                window.wx.playVoice({
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
                window.wx.pauseVoice({
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
                window.wx.playVoice({
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
                window.wx.stopVoice({
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
                window.wx.uploadVoice({
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

            myGeo.getLocation(point, function(result){
                if (result){
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

            myGeo.getPoint(address, function(point){
                if(point){
                    let { lng, lat } = point;

                    resolve({
                        lat,
                        lng
                    });
                }else{
                    reject("您选择的地址没有解析到结果！");
                }
            }, "上海市");
        });
    }
    transformLocation(longitude,latitude,translateCallback){
        var ggPoint = new BMap.Point(longitude,latitude),
            convertor = new BMap.Convertor(),
            pointArr = [];

        pointArr.push(ggPoint);
        convertor.translate(pointArr, COORDINATES_WGS84, COORDINATES_BD09, translateCallback);
    }
    getLocation(params) { //获取定位
        console.log(params);
        let isComponent=false;

        console.log(Vue.prototype.$isNullOrUndefined(params));
        if(Vue.prototype.$isNullOrUndefined(params)){
            if(Object.keys(params).includes("isComponent")){
                isComponent=params.isComponent;
            }
        }

        return new Promise((resolve, reject) => {
            try {
                this.initSDK(isComponent).then(() => {
                    window.wx.getLocation({
                        "type": "wgs84", // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        "success": function (res) {
                            let latitude = res.latitude, // 纬度，浮点数，范围为90 ~ -90
                                longitude = res.longitude,
                                result = gcoord.transform(
                                    [latitude,longitude], // 经纬度坐标
                                    gcoord.WGS84, // 当前坐标系
                                    gcoord.BD09 // 目标坐标系
                                ),json={
                                    "longitudeWgs84":longitude,
                                    "latitudeWgs84":latitude,
                                    "longitudeGcj02":result[1],
                                    "latitudeGcj02":result[0]
                                };
                            // 经度，浮点数，范围为180 ~ -180。
                            // speed = res.speed, // 速度，以米/每秒计
                            // accuracy = res.accuracy, // 位置精度
                            // gps_status = res.gps_status; //gps状态，-1：应用未获取GPS权限；
                            // 0：已获取GPS权限，GPS信号异常；
                            // 1：已获取GPS权限，GPS信号正常，AGPS信号异常；
                            // 2：已获取GPS权限，GPS信号异常，AGPS信号正常；
                            // 3：已获取GPS权限，GPS/AGPS信号正常

                            resolve(json);
                        },
                        "fail": err => {
                            reject(err);
                        }
                    });

                }).catch((err) => {
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
                //init SDK
                reject();
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    stopLocationAutoLBS() { //持续获取LBS信息
        return new Promise((resolve, reject) => {
            try {
                resolve();
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    closeWindow() {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.wx.closeWindow();
                resolve();
            }, () => {
                reject();
            });
        });
    }
    chooseImage (count, type) {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.wx.chooseImage({
                    "count": count, // 默认9
                    "sizeType": ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
                    "sourceType": [type], // 可以指定来源是相册还是相机，默认二者都有
                    "defaultCameraMode": "normal",
                    "success": function (res) {
                        // const localIds = res.localIds, // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                        resolve( res.localIds);
                    },
                    "fail": err => {
                        reject(err);
                    }
                });
            }, () => {
                reject();
            });
        });
    }
    getLocalImgData (id) {
        return new Promise((resolve, reject) => {
            this.initSDK(false).then(() => {
                window.wx.getLocalImgData({
                    "localId": id, // 图片的localID
                    "success": function (res) {
                        console.log(res);
                        // var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                        resolve(res.localData);
                    }
                });
            }, () => {
                reject();
            });
        });
    }
    chooseVideo () {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.wx.invoke("chooseVideo", {
                    "sourceType": ["camera"] // 可以指定来源是相册还是相机，默认二者都有
                }, function(res){
                    const localIds = typeof res.localIds === "object" ? res.localIds : JSON.parse(res.localIds);

                    resolve(localIds[0]);
                }
                );
            }, (err) => {
                reject(err);
            });
        });
    }
    uploadVideo (localId) {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.wx.invoke("uploadVideo", {
                    localId, // 需要上传的视频的本地ID，由chooseVideo接口获得
                    "isShowProgressTips": 1 // 默认为1，显示进度提示
                }, function(res){
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
                window.wx.scanQRCode({
                    "desc": "scanQRCode desc",
                    "needResult": 1, // 默认为0，扫描结果由政务微信处理，1则直接返回扫描结果，
                    "scanType": ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                    "success": function(res) {
                        resolve(res.resultStr);
                    },
                    "error": function(res) {
                        if (res.errMsg.indexOf("function_not_exist") > 0) {
                            reject("版本过低请升级");
                        }
                    }
                });
            });
        });
    }
    postTransformVoice(params) {
        Vue.prototype.$apiFactory.postMediaVoiceSSB({
            "appId": appId,
            "appSecret": appSecret,
            ...params
        });
    }
}