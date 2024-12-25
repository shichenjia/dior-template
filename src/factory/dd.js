import Vue from "vue";
import gcoord from "gcoord";
import dd from "dingtalk-jsapi";
import { uniqueId } from "lodash-es";

const baseFactory = require("./base.js");

let recorder = null,
    corpId = "",
    agentId = "",
    appId = "",
    appSecret = "";

export class ddFactory extends baseFactory {
    constructor() {
        super();
    }
    login(params) {
        return new Promise((resolve, reject) => {
            let api = Vue.prototype.$apiFactory;

            corpId = params.corpId;
            agentId = params.agentId;
            appId = params.appId;
            appSecret = params.appSecret;
            dd.getAuthCode({
                "corpId": params.corpId,
                "success": (res) => {
                    const { code } = res;

                    api
                        .getDDUserId({ agentId, "appKey": appId, appSecret, code })
                        .then((data) => {
                            console.log(data);
                            resolve(data.result.mobile);
                        });
                    this.initSDK(false);
                },
                "fail": (err) => {
                    reject(err);
                },
                "complete": () => {}
            });
        });
    }
    initSDK(isComponent) {
        let api = Vue.prototype.$apiFactory;

        return new Promise((resolve, reject) => {
            api
                .getDDConfig({ agentId, appId, appSecret }, isComponent)
                .then((res) => {
                    dd.config({
                        "agentId": agentId, // 必填，微应用ID
                        "corpId": corpId, //必填，企业ID
                        "timeStamp": res.timestamp, // 必填，生成签名的时间戳
                        "nonceStr": res.noncestr, // 必填，自定义固定字符串。
                        "signature": res.signature, // 必填，签名
                        "type": 0, //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
                        "jsApiList": [
                            "biz.util.chooseImage",
                            "device.geolocation.get",
                            "device.geolocation.start",
                            "device.geolocation.stop",
                            "biz.map.locate",
                            "device.audio.startRecord",
                            "device.audio.stopRecord",
                            "device.audio.onRecordEnd",
                            "device.audio.download",
                            "device.audio.play",
                            "device.audio.pause",
                            "device.audio.resume",
                            "device.audio.stop",
                            "device.audio.onPlayEnd"
                        ] // 必填，需要使用的jsapi列表，注意：不要带dd。
                    });

                    dd.error(function(err) {
                        reject(JSON.stringify(err));
                    }); //该方法必须带上，用来捕获鉴权出现的异常信息，否则不方便排查出现的问题
                    resolve();
                });
        });
    }
  localRecordId = ""
  getRecorderPermission() {
      //获取权限
      return new Promise((resolve, reject) => {
          try {
              resolve();
          } catch (ex) {
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
  startRecorder() {
      //开启录音
      return new Promise((resolve, reject) => {
          this.initSDK(false).then(
              () => {
                  dd.startRecord({
                      "maxDuration": 30
                  });
                  resolve();
              },
              (err) => {
                  reject(err);
              }
          );
      });
  }
  pauseRecorder() {
      //暂停录音
      return new Promise((resolve, reject) => {
          try {
              recorder.pause();
              resolve();
          } catch (error) {
              reject(error);
          }
      });
  }
  resumeRecorder() {
      //继续录音
      return new Promise((resolve, reject) => {
          try {
              recorder.resume();
              resolve();
          } catch (error) {
              reject(error);
          }
      });
  }
  recordServerUrl = ""
  stopRecorder() {
      //结束录音
      // eslint-disable-next-line
    const _this = this
      return new Promise((resolve, reject) => {
          this.initSDK(false).then(
              () => {
                  dd.stopRecord({
                      "success": function(res) {
                          console.log("--------stopRecorder---------------");
                          console.log(res);
                          _this.recordServerUrl = res.remoteUrl;
                          dd.downloadAudio({
                              "mediaId": res.mediaId,
                              success(downloadRes) {
                                  console.log("-------------downloadRes--------------");
                                  console.log(downloadRes);
                                  resolve(downloadRes.localAudioId);
                              }
                          });
                      }
                  });
              },
              (err) => {
                  reject(err);
              }
          );
      });
  }
  destroyRecorder() {
      //销毁录音重新录制
      return new Promise((resolve, reject) => {
          try {
              resolve();
          } catch (error) {
              reject(error);
          }
      });
  }
  playRecorder(localId) {
      //播放录音
      return new Promise((resolve, reject) => {
          this.initSDK(false).then(
              () => {
                  dd.playAduio({
                      "localAudioId": localId
                  });
                  resolve(localId);
              },
              (err) => {
                  reject(err);
              }
          );
      });
  }
  pausePlay(localId) {
      //暂停录音播放
      return new Promise((resolve, reject) => {
          this.initSDK(false).then(
              () => {
                  dd.pauseAduio({
                      "localAudioId": localId
                  });
                  resolve(localId);
              },
              (err) => {
                  reject(err);
              }
          );
      });
  }
  resumePlay(localId) {
      //恢复录音播放
      return new Promise((resolve, reject) => {
          this.initSDK(false).then(
              () => {
                  dd.resumeAudio({
                      "localAudioId": localId
                  });
                  resolve(localId);
              },
              (err) => {
                  reject(err);
              }
          );
      });
  }
  stopPlay(localId) {
      //停止录音播放
      return new Promise((resolve, reject) => {
          this.initSDK(false).then(
              () => {
                  dd.stopAudio({
                      "localAudioId": localId
                  });
                  resolve(localId);
              },
              (err) => {
                  reject(err);
              }
          );
      });
  }
  getRecorderFile() {
      //录音结束后 获取WAV数据 后续统一为base64
      let api = Vue.prototype.$apiFactory;

      return api.postResourceUrl(this.recordServerUrl).then(data => {
          const recordData = data[0];

          return {
              "fileId": recordData.id,
              "fileName": recordData.name,
              "filePath": recordData.path,
              "fileExtension": "",
              "fileSize": recordData.size,
              "fileGroup": "report"
          };

      });
  }
  getAddressByLonLat(coord) {
      return new Promise((resolve, reject) => {
          const myGeo = new BMap.Geocoder(),
              latitude = coord.lat, // 纬度，浮点数，范围为90 ~ -90
              longitude = coord.lon,
              point = new BMap.Point(longitude, latitude);

          myGeo.getLocation(point, function(result) {
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

          myGeo.getPoint(
              address,
              function(point) {
                  if (point) {
                      let { lng, lat } = point;

                      resolve({
                          lat,
                          lng
                      });
                  } else {
                      reject("您选择的地址没有解析到结果！");
                  }
              },
              "上海市"
          );
      });
  }
  getLocation() {
      //获取定位
      return new Promise((resolve, reject) => {
          try {
              dd.getLocation({
                  "coordinate": "0",
                  "success": (res) => {
                      console.log("-----------location------------");
                      console.log(res);
                      const { latitude, longitude } = res,
                          result = gcoord.transform(
                              [latitude, longitude], // 经纬度坐标
                              gcoord.WGS84, // 当前坐标系
                              gcoord.BD09 // 目标坐标系
                          ),
                          json = {
                              "longitudeWgs84": longitude,
                              "latitudeWgs84": latitude,
                              "longitudeGcj02": result[1],
                              "latitudeGcj02": result[0]
                          };

                      resolve(json);
                  }
              });
          } catch (error) {
              reject("定位错误:" + error);
          }
      });
  }
  getLocationAutoLBS() {
      //持续获取LBS信息
      let isComponent = false;

      return new Promise((resolve, reject) => {
          try {
              //init SDK
              this.initSDK(isComponent).then(() => {
                  const uuId = uniqueId();

                  dd.startLocating({
                      "targetAccuracy": 200,
                      "iOSDistanceFilter": 10,
                      "useCache": true,
                      "withReGeocode": false,
                      "callBackInterva": 1000,
                      "sceneId": uuId,
                      success(res) {
                          resolve({ ...res, uuId });
                      }
                  });
              });
          } catch (error) {
              reject("定位错误:" + error);
          }
      });
  }
  stopLocationAutoLBS(uuId) {
      //持续获取LBS信息
      let isComponent = false;

      return new Promise((resolve, reject) => {
          try {
              //init SDK
              this.initSDK(isComponent).then(() => {
                  dd.stopLocating({
                      "sceneId": uuId
                  });
              });
          } catch (error) {
              reject("定位错误:" + error);
          }
      });
  }
  closeWindow() {
      return new Promise((resolve, reject) => {
          dd.closePage({
              success() {
                  resolve();
              },
              fail(err) {
                  reject(err);
              }
          });
      });
  }
  chooseImage(count, type) {
      return new Promise((resolve, reject) => {
          dd.chooseImage({
              "count": type === "camera" ? 1 : count, // 默认9
              "secret": false,
              "position": "back",
              "sourceType": [type], // 可以指定来源是相册还是相机，默认二者都有
              "success": function(res) {
                  // const localIds = res.localIds, // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                  resolve(res.filePaths);
              },
              fail(err) {
                  reject(err);
              }
          });
      });
  }
  uploadFileToServer(id, name, serverUrl) {
      return new Promise((resolve, reject) => {
          dd.uploadFile({
              "fileName": name,
              "filePath": id,
              "fileType": "image",
              "url": serverUrl,
              "success": function(res) {
                  const { data } = res;

                  resolve(JSON.parse(data)[0]);
              },
              "fail": function(err) {
                  reject(err);
              }
          });
      });
  }
  chooseVideo() {
      return new Promise((resolve, reject) => {
          dd.chooseVideo({
              "sourceType": ["album", "camera"],
              "maxDuration": 60,
              success(res) {
                  resolve(res.filePath);
              },
              fail(err) {
                  reject(err);
              }
          });
      });
  }
  uploadVideo(localId) {
      return new Promise((resolve) => {
          resolve(localId);
      });
  }
}
