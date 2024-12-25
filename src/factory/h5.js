import Recorder from "js-audio-recorder";
import gcoord from "gcoord";
const baseFactory = require("./base.js"),
    lamejs = require("lamejs");

let recorder = null;

export class h5Factory extends baseFactory {
    constructor() {
        super();
    }
    login(params) {
        // let that=this;
        return new Promise((resolve) => {
            console.log(self);
            resolve(params.userId);
            // resolve(that.decrypt(params.userId));
        });
    }
    initSDK(isComponent) {
        return new Promise((resolve) => {
            resolve(isComponent);
        });
    }
    getRecorderPermission() { //获取权限
        return new Promise((resolve, reject) => {
            Recorder.getPermission().then(() => {
                resolve("recorder is permission");
            }, (error) => {
                reject("无录音权限:" + error);
            });
        });
    }
    initRecorder() {
        return new Promise((resolve, reject) => {
            try {
                recorder = new Recorder({
                    "sampleBits": 16, // 采样位数，支持 8 或 16，默认是16
                    "sampleRate": 48000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
                    "numChannels": 1 // 声道，支持 1 或 2， 默认是1
                    // compiling: false,(0.x版本中生效,1.x增加中) // 是否边录边转换，默认是false
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    startRecorder() { //开启录音
        return new Promise((resolve, reject) => {
            recorder.start().then(() => {
                resolve("recorder is permission");
            }, (error) => {
                reject(error);
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
            try {
                recorder.stop();
                resolve("");
            } catch (error) {
                reject(error);
            }
        });
    }
    destroyRecorder() { //销毁录音重新录制
        return new Promise((resolve, reject) => {
            try {
                recorder.destroy().then(() => {
                    this.initRecorder().then(
                        () => {
                            resolve();
                        }
                    );
                    // eslint-disable-next-line no-const-assign
                    // recorder=new Recorder({
                    //     "sampleBits": 16, // 采样位数，支持 8 或 16，默认是16
                    //     "sampleRate": 48000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
                    //     "numChannels": 1 // 声道，支持 1 或 2， 默认是1
                    //     // compiling: false,(0.x版本中生效,1.x增加中) // 是否边录边转换，默认是false
                    // });
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    playRecorder(localId) { //播放录音
        return new Promise((resolve, reject) => {
            try {
                recorder.play();
                resolve(localId);
            } catch (error) {
                reject(error);
            }
        });
    }
    pausePlay(localId) { //暂停录音播放
        return new Promise((resolve, reject) => {
            try {
                recorder.pausePlay();
                resolve(localId);
            } catch (error) {
                reject(error);
            }
        });
    }
    resumePlay(localId) { //恢复录音播放
        return new Promise((resolve, reject) => {
            try {
                recorder.resumePlay();
                resolve(localId);
            } catch (error) {
                reject(error);
            }
        });
    }
    stopPlay(localId) { //停止录音播放
        return new Promise((resolve, reject) => {
            try {
                recorder.stopPlay();
                resolve(localId);
            } catch (error) {
                reject(error);
            }
        });
    }
    getRecorderFile(localId) { //录音结束后 获取WAV数据 后续统一为base64
        console.log(localId);
        return new Promise((resolve, reject) => {
            try {
                const
                    channels = 1, //1 for 单声道 or 2 for 立体声
                    sampleRate = 44100, //44.1khz (normal mp3 samplerate)
                    mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128),
                    // 获取左右通道数据
                    result = recorder.getChannelData(),
                    buffer = [],
                    leftData = result.left && new Int16Array(result.left.buffer, 0, result.left.byteLength / 2),
                    rightData = result.right && new Int16Array(result.right.buffer, 0, result.right.byteLength / 2),
                    remaining = leftData.length + (rightData ? rightData.length : 0),
                    maxSamples = 1152,
                    enc = mp3enc.flush();

                for (let i = 0; i < remaining; i += maxSamples) {
                    const left = leftData.subarray(i, i + maxSamples);
                    let right = null,
                        mp3buf = null;

                    if (channels === 2) {
                        right = rightData.subarray(i, i + maxSamples);
                        mp3buf = mp3enc.encodeBuffer(left, right);
                    } else {
                        mp3buf = mp3enc.encodeBuffer(left);
                    }

                    if (mp3buf.length > 0) {
                        buffer.push(mp3buf);
                    }
                }
                if (enc.length > 0) {
                    buffer.push(enc);
                }
                // resolve(new Blob(buffer, {
                //     "type": "audio/mp3"
                // }));
                let voiceObj=new Blob(buffer, {
                        "type": "audio/mp3"
                    }),
                    files=null;

                voiceObj.name=this.uuid()+".mp3";
                files = new window.File([voiceObj], voiceObj.name, { "type": voiceObj.type });
                resolve(files);
            } catch (error) {
                reject(error);
            }
        });
    }
    getLocationIncludeAddress() {
        return new Promise((resolve, reject) => {
            MapLoader().then(AMap => {
                const onComplete = (data) => {
                        let result = gcoord.transform(
                                [data.position.lat, data.position.lng], // 经纬度坐标
                                gcoord.GCJ02, // 当前坐标系
                                gcoord.WGS84 // 目标坐标系
                            ),
                            res = {
                                "lat": result[0],
                                "lng": result[1],
                                "citycode": data.addressComponent.citycode,
                                "province": data.addressComponent.province,
                                "district": data.addressComponent.district,
                                "street": data.addressComponent.street,
                                "streetNumber": data.addressComponent.streetNumber,
                                "township": data.addressComponent.township
                            };

                        resolve(res);
                    },
                    onError = (data) => {
                        reject("定位失败错误:" + JSON.stringify(data));
                    };

                AMap.plugin("AMap.Geolocation", function () {
                    let geolocation = new AMap.Geolocation({
                        "enableHighAccuracy": true, // 是否使用高精度定位，默认:true
                        "timeout": 10000, // 超过10秒后停止定位，默认：无穷大
                        "maximumAge": 0, // 定位结果缓存0毫秒，默认：0
                        "convert": false // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    });

                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, "complete", onComplete);
                    AMap.event.addListener(geolocation, "error", onError);
                });

            }, e => {
                reject("地图加载失败:" + e);
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
                    console.log(result);
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
        return new Promise((resolve, reject) => {
            const geolocation = new BMap.Geolocation();

            geolocation.enableSDKLocation();
            geolocation.getCurrentPosition(function(r){
                console.log(r);
                if(geolocation.getStatus() === BMAP_STATUS_SUCCESS){

                    const transform = gcoord.transform(
                            [r.longitude,r.latitude], // 经纬度坐标
                            gcoord.BD09, // 当前坐标系
                            gcoord.WGS84 // 目标坐标系
                        ),

                        result = {
                            "longitudeWgs84": transform[0],
                            "latitudeWgs84": transform[1],
                            "longitudeGcj02": r.longitude,
                            "latitudeGcj02":  r.latitude
                        };

                    console.log("🚀 ~ file: h5.js:308 ~ h5Factory ~ geolocation.getCurrentPosition ~ transform:", transform);
                    resolve(result);

                } else {
                    reject("地图定位失败！");
                    console.error("failed"+geolocation.getStatus());
                }
            });

        });

    }
    getLocationAutoLBS(params) { //持续获取LBS信息
        return new Promise((resolve, reject) => {
            try {
                resolve(params);
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    stopLocationAutoLBS(params) { //持续获取LBS信息
        return new Promise((resolve, reject) => {
            try {
                resolve(params);
            } catch (error) {
                reject("定位错误:" + error);
            }
        });
    }
    closeWindow() {
        return new Promise((resolve) => {
            resolve();
        });
    }
    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return (
            s4() +
    s4() +
    s4() +
    s4()
        );
    }
    scanQRCode() {
        return Promise.reject("H5下不支持扫码，请使用政务微信端上报！");
    }
}
// module.exports=h5Factory;