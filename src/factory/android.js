import gcoord from "gcoord";
import { Toast } from "vant";
const baseFactory = require("./base.js");

let recorder = null,
    wx=window.wx,
    imageList=[];


export class androidFactory extends baseFactory {
    constructor() {
        super();
        this.loadScript();
    }
    loadScript() {
        if (typeof window.jsh3h !== "undefined") {
            return;
        }
        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = location.origin + location.pathname + "static/js/jsh3h-1.0.0.js";
        if (script.readyState) { // IE
            script.onreadystatechange = function() {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    window.jsh3h.init();
                }
            };
        } else { // Other browsers
            script.onload = function() {
                window.jsh3h.init();
            };
        }
        document.getElementsByTagName("head")[0].appendChild(script);
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

    initAgentConfig(isComponent) {

        return new Promise((resolve) => {
            resolve(isComponent);
        });
    }
    getRecorderPermission() { //获取权限
        return new Promise((resolve, reject) => {
            try{
                resolve();
            } catch(ex){
                reject(ex);
            }
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
            try {
                window.jsh3h.startRecordAudio(response => {
                    console.log("-----startRecordAudio-----");
                    console.log(response);
                    resolve();
                });

            } catch (error) {
                reject(error);
            }
        });
    }
    pauseRecorder() { //暂停录音
        return new Promise((resolve, reject) => {
            try {
                let audioFileName="";

                window.jsh3h.stopRecordAudio(response => {
                    console.log("-----stopRecordAudio-----");
                    console.log(response);
                    if (response && response.fileName) {
                        audioFileName = response.fileName;
                        resolve(audioFileName);
                    }
                });
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
                let audioFileName="";

                window.jsh3h.stopRecordAudio(response => {
                    console.log("-----stopRecordAudio-----");
                    console.log(response);
                    if (response && response.fileName) {
                        audioFileName = response.fileName;
                        resolve(audioFileName);
                    }
                });
            } catch (error) {
                reject(error);
            }
            // this.initSDK(false).then(() => {
            //     wx.stopRecord({
            //         "success": function (res) {
            //             resolve(res.localId);
            //         }
            //     });
            // }, (err) => {
            //     reject(err);
            // });
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
    playRecorder(audioFileName) { //播放录音
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.startPlayAudio({"uri": audioFileName}, response => {
                    console.log("-----startPlayAudio android-----");
                    console.log(response);
                    resolve(audioFileName);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    pausePlay(audioFileName) { //暂停录音播放
        console.log(audioFileName);
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.stopPlayAudio(response => {
                    console.log("-----stopPlayAudio-----");
                    console.log(response);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
            // this.initSDK(false).then(() => {
            //     wx.pauseVoice({
            //         localId
            //     });
            //     resolve(localId);
            // }, (err) => {
            //     reject(err);
            // });
        });
    }
    resumePlay(localId) { //恢复录音播放
        console.log(localId);
        return new Promise((resolve, reject) => {
            try {
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    stopPlay(localId) { //停止录音播放
        console.log(localId);
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.stopPlayAudio(response => {
                    console.log("-----stopPlayAudio-----");
                    console.log(response);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
            // this.initSDK(false).then(() => {
            //     wx.pauseVoice({
            //         localId
            //     });
            //     resolve(localId);
            // }, (err) => {
            //     reject(err);
            // });
        });
    }
    getRecorderFile(fileUrl, { baseUrl, id, groupName } ) { //android 获取到本地路径
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.uploadFiles({
                    "url": baseUrl,
                    "files": [
                        {
                            "name": String(id),
                            "filename": id + ".mp3",
                            "filepath": fileUrl
                        }
                    ]
                }, response => {
                    if (typeof response === "object") {
                        if (response.statusCode === 200) {
                            const data = JSON.parse(response.body)[0];

                            resolve({
                                "fileId": data.id,
                                "fileName": data.name,
                                "filePath": data.path,
                                "fileExtension": data.ext,
                                "fileSize": data.size,
                                "fileGroup": groupName
                            });
                        } else {
                            reject("上传录音失败！");
                        }
                    }
                });

            } catch (error) {
                reject(error);
            }
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
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.getCurrentLocation(response => {
                    console.log(response);
                    if (typeof response === "object") {
                        console.log(response.location);
                        let latitude = response.location.y, // 纬度，浮点数，范围为90 ~ -90
                            longitude = response.location.x,
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
                wx.closeWindow();
                resolve();
            }, () => {
                reject();
            });
        });
    }
    chooseImage (count, type) {
        imageList=[];
        let ids=[],index=0;

        return new Promise((resolve, reject) => {
            this.initSDK().then(() => {
                try {
                    if(type==="camera"){
                        window.jsh3h.takePicture({"quality": 0.6, "pictureWaterOptions": {
                            // "text": "上海三高计算机中心股份有限公司abc",
                            // "textPosition": "bottomLeft",
                            // "textColor": "#ff0000",
                            // "textSize": 80
                        }}, response => {
                            console.log("takePicture",response);
                            console.log("takePicture",response.type);
                            ids[index]="index"+index;
                            imageList.push({
                                "id":ids[index],
                                "data":"data:"+response.type+";base64,"+response.data
                            });
                            index++;
                            resolve(ids);
                        });
                    } else{
                        console.log("限制照片:"+count);
                        window.jsh3h.chooseImages({
                            "selectionLimit": count,
                            "mediaType": "photo",
                            "includeBase64": true,
                            "includeExtra": true,
                            "quality": 0.6}, response => {

                            if(this.hasProperty(response, "errorMessage")) {
                                Toast.fail("超出最大上传照片张数，请重新选择！");
                                reject();
                            } else{
                                try{
                                    // console.log("chooseImages",response);
                                    // console.log("assets size:"+response.assets.length);
                                    for(let i=0;i<response.assets.length;i++){
                                        let assets=response.assets[i];

                                        console.log(assets);

                                        ids[index]="index"+index;
                                        imageList.push({
                                            "id":ids[index],
                                            "data":"data:"+assets.type+";base64,"+assets.base64
                                        });
                                        index++;
                                    }
                                    resolve(ids);
                                }catch(ex){
                                    reject();
                                }

                            }
                        });
                    }

                } catch (error) {
                    reject();
                }
            }, () => {
                reject();
            });
        });
    }
    getLocalImgData (id) {
        return new Promise((resolve, reject) => {
            // console.log("getLocalImgData");
            // console.log(imageList.length);
            // console.log(imageList);
            try{
                for(let i=0;i<imageList.length;i++){
                    if(imageList[i].id===id){
                        resolve(imageList[i].data);
                    }
                }

            }catch(error){
                reject();
            }
            // try {
            //     if(type==="camera"){
            //        window.jsh3h.takePicture({"quality": 0.6, "pictureWaterOptions": {
            //             // "text": "上海三高计算机中心股份有限公司abc",
            //             // "textPosition": "bottomLeft",
            //             // "textColor": "#ff0000",
            //             // "textSize": 80
            //         }}, response => {
            //             console.log("takePicture",response);
            //             console.log("takePicture",response.type);
            //             resolve("data:"+response.type+";base64,"+response.data);
            //         });
            //     } else{
            //        window.jsh3h.chooseImage({"quality": 0.6, "pictureWaterOptions": {
            //             // "text": "上海三高计算机中心股份有限公司abc",
            //             // "textPosition": "bottomLeft",
            //             // "textColor": "#ff0000",
            //             // "textSize": 80
            //         }}, response => {
            //             console.log("chooseImage",response);
            //             console.log("chooseImage",response.type);
            //             resolve("data:"+response.type+";base64,"+response.data);
            //         });
            //     }
            // } catch (error) {
            //     reject();
            // }
        });
    }
    chooseVideo () {
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.takeVideo({"mediaType": "video", "durationLimit": 10}, response => {
                    console.log("-----<chooseVideo>-----");
                    console.log(response);
                    resolve("file:///" + response.path);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    uploadVideo (localId, { baseUrl, id, groupName }) {
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.uploadFiles({
                    "url": baseUrl,
                    "files": [
                        {
                            "name": String(id),
                            "filename": id + ".mp4",
                            "filepath": localId
                        }
                    ]
                }, response => {
                    if (typeof response === "object") {
                        if (response.statusCode === 200) {
                            const data = JSON.parse(response.body)[0];

                            resolve({
                                "fileId": data.id,
                                "fileName": data.name,
                                "filePath": data.path,
                                "fileExtension": data.ext,
                                "fileSize": data.size,
                                "fileGroup": groupName
                            });
                        } else {
                            reject("上传视频失败！");
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    scanQRCode() {
        console.log("======scanQRCode=====");
        return new Promise((resolve, reject) => {
            try {
                window.jsh3h.getQRCode(response => {
                    console.log("-----<2>-----");
                    console.log(response);
                    console.log(response.barCode);
                    resolve(response.barCode);
                });

            } catch (error) {
                reject(error);
            }
        });
    }
    hasProperty(obj, prop) {
        return prop in obj; // 或者使用 obj.hasOwnProperty(prop);
    }
}