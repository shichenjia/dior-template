import Vue from "vue";
import gcoord from "gcoord";
const baseFactory = require("./base.js");

let recorder = null,
    appId = "",
    agentId="",
    appSecret = "",
    weappAppId="",
    weappAppSecret="";

export class wxMiniFactory extends baseFactory {
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
        return new Promise((resolve) => {
            weappAppId=appId=params.weappAppId;
            agentId=params.agentId;
            weappAppSecret= appSecret = params.weappAppSecret;
            console.log(params);
            resolve(sessionStorage.getItem("phone"));
        });
    }
    initSDK(isComponent) {
        let api = Vue.prototype.$apiFactory;

        return new Promise((resolve, reject) => {
            api.getWXConfigWX(weappAppId,weappAppSecret,isComponent).then((res) => {
                //微信js-skd 初始化
                window.wx.config({
                    "beta": true, // 调用wx.invoke形式的接口值时，该值必须为true。
                    "debug": false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    "appId": appId,
                    "timestamp": res.timestamp,
                    "nonceStr": res.noncestr,
                    "signature": res.signature,
                    "jsApiList": [
                        "checkJsApi",
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
                        "getNetworkType",
                        "openLocation",
                        "getLocation",
                        "closeWindow",
                        "scanQRCode"
                    ]
                });
                resolve();
            }, () => {
                reject();
            });
                
        });
    }
    initAgentConfig(isComponent) {
        let api = Vue.prototype.$apiFactory;

        return new Promise((resolve, reject) => {
            api.getAgentConfig(appSecret,isComponent).then((res) => {
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
                    "timestamp":parseInt( res.timestamp),// 必填，生成签名的时间戳,int类型, 如 1539100800
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
        let isComponent=false;

        return new Promise((resolve, reject) => {
            try {
                //init SDK
                this.initSDK(isComponent).then(() => {
                    //injection  agentConfig
                    this.initAgentConfig(isComponent).then(()=>{
                        window.wx.invoke("startAutoLBS",{
                            "type": "wgs84", // wgs84是gps坐标，gcj02是火星坐标
                            "continue":  1 // 默认关闭，值为1的时候启用。页面关闭后，也可继续获取成员的位置信息。需在“应用详情” - “接收消息”页面配置“实时位置信息事件”回调接口，此参数才会生效。
                        }, function(res) {
                            console.log("=======startAutoLBS=======");
                            console.log(res);
                            if (res.err_msg === "startAutoLBS:ok") {
                                resolve(res);
                            } else {
                                reject(res);
                            }
                        });
                    });
                }, (err) => {
                    reject(err);
                });
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    stopLocationAutoLBS() { //持续获取LBS信息
        let isComponent=false;

        return new Promise((resolve, reject) => {
            try {
                //init SDK
                this.initSDK(isComponent).then(() => {
                    //injection  agentConfig
                    this.initAgentConfig(isComponent).then(()=>{
                        window.wx.ready(function() {
                            window.wx.invoke("stopAutoLBS",{}, function(res) {
                                console.log("=======stopAutoLBS=======");
                                console.log(res);
                                if (res.err_msg === "stopAutoLBS:ok") {
                                    resolve(res);
                                } else {
                                    reject(res);
                                }
                            });
                        });
                    });
                }, (err) => {
                    reject(err);
                });
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
                window.wx.ready(() => {
                    window.wx.chooseImage({
                        "count": type === "camera" ? 1 : count, // 默认9
                        "sizeType": ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
                        "sourceType": [type], // 可以指定来源是相册还是相机，默认二者都有
                        "success": function (res) {
                        // const localIds = res.localIds, // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片

                            resolve( res.localIds);
                        }
                    });
                }, () => {
                    reject();
                });
            });
        });
    }
    getLocalImgData (id, isAndroid) {
        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                window.wx.getLocalImgData({
                    "localId": id, // 图片的localID
                    "success": function (res) {
                        // var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                        if (isAndroid) {
                            resolve(`data:image/png;base64,${res.localData}`);
                        } else {
                            resolve(res.localData);
                        }
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
                });
            }, (err) => {
                reject();
            });
        });
    }
    postTransformVoice(params) {
        Vue.prototype.$apiFactory.postMediaVoiceWX({
            "appId": appId,
            "appSecret": appSecret,
            ...params
        });
    }
}