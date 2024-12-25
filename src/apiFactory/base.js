import store from "@/store";
import axios from "axios";
import router from "@/router";
import Vue from "vue";
import { ESDataFormat, getQueryStringByHash } from "@/utils";
import qs from "qs";
// 全局判断是否IOS方法
function isIos() {
    const u = navigator.userAgent;

    return u.indexOf("iPhone") > -1 || u.indexOf("Mac OS") > -1;
}
const requestFn = {
    "url": "",
    "noTokenList": ["wxConfing", "mediaUrl", "messageApi", "areaUrl", "ssbConfing", "authCode", "ssbTokenUrl", "smyUrl", "voiceUrl", "wmUrl", "updateMapUrl", "tdMapToken","zzReport"],
    init(option) {
        if (this.noTokenList.includes(option.urlKey)) {
            return this.noTokenFn(option);
        }
        try {
            return this[option.urlKey](option);
        } catch (error) {
            throw new Error("配置项转换失败！");
        }
    },
    setOption(option) {
        const params = option.params,
            methodType = option.methodType,
            urls = store.getters["app/appConfig"].urls,
            urlKey = option.urlKey || "govWechat",
            config = {};

        this.url = urls[0][urlKey];
        if (methodType === "post" || methodType === "put") {
            const clientType = store.getters["app/clientType"];

            config.data = params;
            if (option.urlKey === "govWechat") {
                config.data.clientType = clientType;
            }
        } else {
            config.params = params;
        }
        return config;
    },
    noTokenFn(option) {
        const config = this.setOption(option);

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": option.headers || {
                "Content-Type": "application/json"
            },
            ...config
        });
    },
    govWechat(option) {
        const config = this.setOption(option),
            token = store.getters["user/access_token"];

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": option.headers || {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            validateStatus(status) {
                // 如果这个人是有一线通达的权限但是没有业务权限
                if (status === 400 && option.methodName === "api/v1/mobile-token") {
                    if (getQueryStringByHash("type") !== "weapp") {
                        router.push({
                            "path": "/error",
                            "query": {
                                "message": Vue.prototype.$encrypt(`手机号${config.data.mobileNo}暂无权限`)
                            }
                        });
                    }
                } else if (status === 500 && option.methodName === "api/v1/mobile-token") {
                    router.push({
                        "path": "/error",
                        "query": {
                            "message": Vue.prototype.$encrypt("接口报错了,请联系管理员！")
                        }
                    });
                }
                return status === 200;
            },
            ...config
        });
    },
    doubleCallRecordUrl(option) {
        let config = this.setOption(option);

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers":  option.headers,
            "responseType": "arraybuffer",
            ...config
        });
    },
    bjcjUrl(option) {
        const config = this.setOption(option),
            token = store.getters["user/surveyToken"],
            headers =
                {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                };

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": headers,
            ...config
        });
    },
    yxtdUrl(option) {
        const config = this.setOption(option),
            wxLoginToken = sessionStorage.getItem("wxLoginToken"),
            headers = option.headers ?
                {
                    ...option.headers,
                    "TdwxAuthorization": wxLoginToken
                } :
                {
                    "Content-Type": "application/json",
                    "TdwxAuthorization": wxLoginToken
                };

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": headers,
            ...config
        });
    },
    zzListUrl(option) {
        const config = this.setOption(option),
            isLoginRequest = option.methodName === "getToken",
            headers = {
                "Content-Type": "application/json"
            };

        if (!isLoginRequest) {
            headers.zzToken = sessionStorage.getItem("zzToken");
        }

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": headers,
            ...config
        });
    },
    thirdUrl(option) {
        const urls = store.getters["app/appConfig"].urls,
            urlKey = option.urlKey || "govWechat",
            url = urls[0][urlKey],
            isLoginRequest = option.methodName.indexOf("login") > 0,
            headers = {
                "Content-Type": "application/json"
            };
        let config = {};

        if (!isLoginRequest) {
            headers.Token = sessionStorage.getItem("JDToken");
        }
        if (option.isData) {
            config.data = option.params;
        } else {
            config.params = option.params;
        }
        return axios({
            "url": url + option.methodName,
            "method": option.methodType,
            "headers": headers,
            ...config
        });
    },
    surveyUrl(option) {
        const urls = store.getters["app/appConfig"].urls,
            urlKey = option.urlKey || "govWechat",
            url = urls[0][urlKey],
            token = store.getters["user/surveyToken"],
            bToken = store.state.user.baseToken,
            isLoginRequest = option.methodName.indexOf("login") > 0,
            isUserRequest = option.methodName.indexOf("user") > 0,
            commandHeader = {
                "Content-Type": "application/json"
            };
        let config = {};

        // if (!isLoginRequest && token) {
        //     commandHeader.Authorization = "Bearer " + token;
        // }
        if (!isLoginRequest) {
            if(token) {
                commandHeader.Authorization = "Bearer " + token;
            }
            commandHeader.XAuthorization = bToken;
        }

        if (option.isData) {
            config.data = option.params;
            if (option.isNeedPhone && !token) {
                config.data = {
                    ...option.params,
                    "phoneNo": sessionStorage.getItem("phone")
                };
            }
        } else {
            config.params = option.params;
        }
        // 如果token不存在并且不是登陆或者user接口
        if (
            (!token && (!isLoginRequest && !isUserRequest)) ||
      (option.isNeedPhone && !token)
        ) {
            config.params = {
                ...config.params,
                "phoneNo": sessionStorage.getItem("phone")
            };
        }
        return axios({
            "url": url + option.methodName,
            "method": option.methodType,
            "headers": commandHeader,
            ...config
        });
    },
    dataApi(option) {
        const config = this.setOption(option),
            PCODE = store.getters["user/reportingDeptCode"],
            tokenInfo = JSON.parse(localStorage.getItem("tokenInfo"));

        if (tokenInfo && option.methodName.indexOf("login") < 0) {
            config.params.token = tokenInfo.token;
            config.params.PCODE = PCODE;
        }

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": option.headers || {
                "Content-Type": "application/json"
            },
            ...config
        });
    },
    esUrl(option) {
        const config = this.setOption(option),
            token = localStorage.getItem("esToken"),
            deptLevel = store.getters["user/deptLevel"],
            userId = store.getters["user/userId"],
            deptCode = store.getters["user/reportingDeptCode"];

        if (option.methodName.indexOf("statUserOperateLog") < 0) {
            config.params.deptLevel = deptLevel;
            config.params.userId = userId;
            config.params.deptCode = deptCode;
        }
        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": option.headers || {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
                token
            },
            ...config
        });
    },
    yjUrl(option) {
        const config = this.setOption(option),
            yjToken = JSON.parse(localStorage.getItem("yjToken")),
            headers = option.headers ?
                {
                    ...option.headers,
                    "Authorization": "Bearer " + yjToken
                } :
                {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + yjToken
                };


        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": headers,
            ...config
        });
    },
    staticalApi(option) {
        const config = this.setOption(option);

        return axios({
            "url": this.url + "/" + option.methodName,
            "method": option.methodType,
            "headers": option.headers,
            ...config
        });
    }
};

export class baseApiFactory {
  cancelFn = null
  constructor() {
      this.base = "api/v1/";
      this.basev2 = "api/v2/";
      this.basev3 = "dispatch-service/api/wxtd/";
  }
  cancelResponse() {
      if (typeof this.cancelFn === "function") {
          this.cancelFn("终止请求");
      }
  }
  //获取微信登入信息
  getWXConfig(appSecret, isComponent) {
      let url =
        window.location.origin +
        window.location.pathname +
        window.location.search,
          urls = location.href.split("#")[0],
          wxSignUrl = store.getters["app/wxSignUrl"];

      //放弃不用
      if (isIos() && isComponent) {
          url = wxSignUrl;
      }
      console.log("==========");
      console.log("urls:" + urls);
      console.log("wxSignUrl:" + wxSignUrl);
      console.log("url:" + url);
      console.log("==========");

      return this.requestData({
          "methodType": "get",
          "methodName": "jsapi-signature",
          "urlKey": "wxConfing",
          "params": {
              "url": urls,
              "appSecret": appSecret
          }
      });
  }

  getWXConfigWX(appId, appSecret, isComponent) {
      let url =
        window.location.origin +
        window.location.pathname +
        window.location.search,
          urls = location.href.split("#")[0],
          wxSignUrl = store.getters["app/wxSignUrl"];

      //放弃不用
      if (isIos() && isComponent) {
          url = wxSignUrl;
      }
      console.log("==========");
      console.log("urls:" + urls);
      console.log("wxSignUrl:" + wxSignUrl);
      console.log("url:" + url);
      console.log("==========");

      return this.requestData({
          "methodType": "get",
          "methodName": "wx-jsapi-signature",
          "urlKey": "wxConfing",
          "params": {
              "url": urls,
              "appId": appId,
              "appSecret": appSecret
          }
      });
  }
  getWXConfigZW(appSecret, isComponent) {
      let urls = location.href.split("#")[0],
          wxSignUrl = store.getters["app/wxSignUrl"];


      //放弃不用
      if (isIos() && isComponent) {
          console.log("ios");
          //   urls = wxSignUrl;
          //   urls=location.href.replace(location.hash, "");
      }
      console.log("==========");
      console.log("window :" + window.location);
      console.log("urls:" + encodeURIComponent(urls));
      console.log("urls:" + encodeURIComponent(encodeURIComponent(urls)));
      console.log("wxSignUrl:" + wxSignUrl);
      console.log("==========");

      return this.requestData({
          "methodType": "get",
          "methodName": "/ssb/jsapi-signature",
          "urlKey": "ssbConfing",
          "params": {
              "url":encodeURIComponent(urls),
              "appSecret": appSecret
          }
      });
  }

  getAuthSign() {
      return this.requestData({
          "methodType": "get",
          "methodName": "mioa-organization-authentication/jaxrs/ythbgpt/signature",
          "urlKey": "authCode",
          "params": null
      });
  }
  getUserPhoneByToken(token) {
      return this.requestData({
          "methodType": "get",
          "methodName": "general-consumer/pt-ssb/check-token",
          "urlKey": "ssbTokenUrl",
          "params": {
              token
          }
      });
  }
  getAccessTokenByTicket(ticket) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/ssb/mh/access-token",
          "urlKey": "wxConfing",
          "params": {
              ticket
          }
      });
  }
  getUserInfoByAccessToken(accessToken, identity) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/ssb/mh/user",
          "urlKey": "wxConfing",
          "params": {
              accessToken,
              identity
          }
      });
  }
  sjGetAccessTokenByCode(code) {
      return this.requestData({
          "methodType": "get",
          "methodName": "sj/access-token/"+code,
          "urlKey": "ssbConfing",
          "params": {
          }
      });
  }
  sjGetUserInfoByAccessToken(accessToken) {
      return this.requestData({
          "methodType": "get",
          "methodName": "sj/user-info/"+accessToken,
          "urlKey": "ssbConfing",
          "params": {

          }
      });
  }
  sjGetCustomByAccessToken(accessToken) {
      return this.requestData({
          "methodType": "get",
          "methodName": "sj/custom/"+accessToken,
          "urlKey": "ssbConfing",
          "params": {

          }
      });
  }

  //获取微信登入信息
  getAgentConfigZW(appSecret, isComponent) {
      let url =
      window.location.origin +
      window.location.pathname,
          urls = location.href.split("#")[0],
          wxSignUrl = store.getters["app/wxSignUrl"];

      if (isIos() && isComponent) {
          url = wxSignUrl;
      }
      console.log("=====getAgentConfig=====");
      console.log("urls:" + urls);
      console.log("wxSignUrl:" + wxSignUrl);
      console.log("url:" + url);
      console.log("=====getAgentConfig=====");
      return this.requestData({
          "methodType": "get",
          "methodName": "/ssb/ticket",
          "urlKey": "ssbConfing",
          "params": {
              "url": encodeURIComponent(urls),
              "appSecret": appSecret
          }
      });
  }
  //获取微信登入信息
  getAgentConfig(appSecret, isComponent) {
      let url =
        window.location.origin +
        window.location.pathname +
        window.location.search,
          urls = location.href.split("#")[0],
          wxSignUrl = store.getters["app/wxSignUrl"];

      if (isIos() && isComponent) {
          url = wxSignUrl;
      }
      console.log("=====getAgentConfig=====");
      console.log("urls:" + urls);
      console.log("wxSignUrl:" + wxSignUrl);
      console.log("url:" + url);
      console.log("=====getAgentConfig=====");
      return this.requestData({
          "methodType": "get",
          "methodName": "agentConfig-signature",
          "urlKey": "wxConfing",
          "params": {
              "url": url,
              "appSecret": appSecret
          }
      });
  }
  //获取微信端用户信息
  getToken(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "access-token",
          "urlKey": "wxConfing",
          "params": {
              "appSecret": params.appSecret
          }
      });
  }
  // 获取钉钉用户手机号
  getDDUserId(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "ding/user",
          "urlKey": "wxConfing",
          "params": params
      });
  }
  // 钉钉初始化sdk
  getDDConfig(params, isComponent) {
      let url =
    window.location.origin +
    window.location.pathname +
    window.location.search,
          urls = location.href.split("#")[0],
          wxSignUrl = store.getters["app/wxSignUrl"];

      //放弃不用
      if (isIos() && isComponent) {
          url = wxSignUrl;
      }
      console.log("==========");
      console.log("urls:" + urls);
      console.log("wxSignUrl:" + wxSignUrl);
      console.log("url:" + url);
      console.log("==========");

      return this.requestData({
          "methodType": "get",
          "methodName": "ding/sign",
          "urlKey": "wxConfing",
          "params": {
              "url": urls,
              "appKey": params.appId,
              "appSecret": params.appSecret,
              "agentId": params.agentId
          }
      });
  }
  //获取微信端用户信息
  getWXUser(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "user-info",
          "urlKey": "wxConfing",
          "params": {
              "code": params.code,
              "appSecret": params.appSecret,
              "timestamp": new Date().getTime() + Math.random()
          }
      });
  }
  //获取微信端用户信息
  getZWUser(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": `/ssb/user-info/${params.code}/${params.zwAppSecret}`,
          "urlKey": "ssbConfing",
          "params": null
      });
  }
  //获取微信端用户信息
  getWXUserPhone(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "wx-user-phone",
          "urlKey": "wxConfing",
          "params": {
              "code": params.code,
              "appId": params.appId,
              "appSecret": params.appSecret
          }
      });
  }
  //获取认证信息
  getRsaEncrypt(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "rsa-encrypt",
          "urlKey": "wxConfing",
          "params": params
      });
  }
  // 获取市民云签名
  getSNYSign(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "get-sign",
          "urlKey": "smyUrl",
          "params": params
      });
  }
  //获取市民云用户信息
  getSMYUserId(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": "get-user-info",
          "urlKey": "smyUrl",
          "params": params
      });
  }
  //获取市民云accessToken
  getSMYAccessToken(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": "get-access-token",
          "urlKey": "smyUrl",
          "params": params
      });
  }
  // 获取市民云应用token
  getSMYInvokeToken(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": "get-invoke-token",
          "urlKey": "smyUrl",
          "params": params
      });
  }
  //获取天地图token
  getTdMapToken() {
      return this.requestData({
          "methodType": "get",
          "methodName": "ToolShare/BusinessLogin",
          "urlKey": "tdMapToken",
          "params": {
              "appKey": "8kr82e6xcdbn6s8dn6j8s7hrb3",
              "sid": "99990101",
              "rid": "AH0998"
          }
      });
  }
  //更新地图状态
  updateTdMapStatus(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": "Special/WGH/UpdateNczjfStatus/",
          "urlKey": "tdMapToken",
          "params": params
      });
  }
  // 拨打电话
  postOutbound(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "tasks/outbound",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 先联信息保存
  postFirstContact(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "tasks/first-contact",
          "urlKey": "govWechat",
          "params": data
      });
  }
  //获取录音url
  getRecordUrl(recordId, headerOpt) {
      return this.requestData({
          "methodType": "get",
          "methodName":  `${recordId}`,
          "urlKey": "doubleCallRecordUrl",
          "params": null,
          "headers": headerOpt
      });
  }
  // 获取是否一小时内拨打过
  getFirstContactTips(taskId, callType) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/first-contact-tips",
          "urlKey": "govWechat",
          "params": {
              taskId,
              callType
          }
      });
  }
  // 获取双呼详情
  getDoubleCallDetail(taskId) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/first-contacts",
          "urlKey": "govWechat",
          "params": {
              taskId
          }
      });
  }
  // 获取待接单和待处理的数据
  getCaseList(data) {
      let url = "",
          urlKey = "govWechat",
          params = data;

      switch (data.casetype) {
              case "待接单":
              case "热线案例分析":
                  url = this.base + "user/takes/grids";
                  break;
              case "待处理":
                  url = this.base + "user/solves/grids";
                  break;
              case "待核查":
                  url = this.base + "user/checks";
                  break;
              case "待核实":
                  url = this.base + "user/verifications";
                  break;
              case "退单审核":
                  url = this.base + "user/solves/grids";
                  break;
              case "延期审核":
                  url = this.base + "user/checks";
                  break;
              case "协同审核":
                  url = this.base + "user/synergys/checks";
                  break;
              case "问题上报":
                  url = this.base + "tasks/reports";
                  break;
              case "案件核查":
                  url = this.base + "tasks/checks";
                  break;
              case "案件核实":
                  url = this.base + "tasks/verifications";
                  break;
              case "待指挥":
                  url = this.base + "tasks/command-dispatches";
                  data.casetype = "";
                  data.status = "未指挥";
                  break;
              case "指挥中":
                  url = this.base + "user/tasks/command-disposals";
                  data.casetype = "";
                  break;
              case "已归档":
                  url = this.base + "user/tasks/command-ends";
                  break;
              case "一体化我的案件":
                  url = this.base + "users/self-command-reports";
                  data.casetype = "我的案件";
                  break;
              case "已核查":
                  url = this.base + "tasks/checks";
                  break;
              case "已核实":
                  url = this.base + "tasks/verifications";
                  break;
              case "已处理":
                  url = this.base + "tasks/dispositions";
                  break;
              case "12345热线":
                  url = this.base + "users/self-command-reports";
                  urlKey = "dataApi";
                  params = {
                      "TID": data.taskid,
                      ...data
                  };
                  break;
              default:
      }
      delete params.casetype;
      return this.requestData({
          "methodType": "get",
          "methodName": url,
          urlKey,
          params
      });
  }
  // 获取案件属性 大类 小类 子类
  getCategory(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "user/classes",
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 获取案件属性 大类 小类 子类
  getQuickCategory(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "quick-classes",
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 根据taskid查询详情
  getUserTaskesBytaskid(params) {
      let url = "",
          caseType = params.caseType;

      switch (caseType) {
              case "待接单":
              case "待处理":
              case "热线案例分析":
                  url = this.base + "dispatches/";
                  break;
              case "待核查":
                  url = this.base + "checks/";
                  break;
              case "待核实":
                  url = this.base + "verifications/";
                  break;
              case "退单审核":
                  url = this.base + "dispatches/";
                  break;
              case "延期审核":
                  url = this.base + "checks/";
                  break;
              case "协同审核":
                  url = this.base + "synergys/";
                  break;
              case "问题上报":
              case "12345热线":
                  url = this.base + "tasks/";
                  break;
              case "案件核查":
                  url = this.base + "tasks/checks/";
                  break;
              case "案件核实":
                  url = this.base + "tasks/verifications/";
                  break;
              case "指挥中":
              case "已归档":
              case "待指挥":
              case "一体化待接单":
              case "一体化待处理":
              case "再派遣":
                  url = this.base + "command-tasks/";
                  break;
              case "详情":
                  url = this.base + "command-dispatches/";
                  break;
              case "已核查":
                  url = this.base + "tasks/checks/";
                  break;
              case "已核实":
                  url = this.base + "tasks/verifications/";
                  break;
              case "已处理热线":
              case "已处理网格":
                  url = this.base + "tasks/dispositions/";
                  break;
              case "区级督查问题上报":
              case "区级督查已核查":
              case "区级督查已处理热线":
              case "区级督查已处理网格":
              case "区级督查已核实":
                  url = this.basev2 + "ins-tasks/";
                  break;
              case "区级督查待核实":
                  url = this.base + "ins-verifications/";
                  break;
              case "区级督查待核查":
                  url = this.base + "ins-checks/";
                  break;
              case "统一详情":
                  url = this.basev2 + "tasks/";
                  break;
              default:
      }
      return this.requestData({
          "methodType": "get",
          "methodName": url + params.taskid,
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 提交退单信息
  chargeBack(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/rejects/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 接单
  acceptOrder(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/takes/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 延期
  postDelay(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/delay/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 处置中如果caseType为待接单
  postTasks(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/takes/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 处置 网格
  postGrids(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/solves/grids/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 处置 热线
  postHotlines(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/solves/hotlines/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 获取转派人员
  getTransferPerson(taskId) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + `tasks/${taskId}/transfer/users`,
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 转派
  postTransfer(taskId, data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + `/tasks/${taskId}/transfer`,
          "urlKey": "govWechat",
          "params": data
      });
  }
  //核实
  postVerifications(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/verifications/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  //区级督查核实
  postInsVerifications(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/ins-verifications/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  //核查
  postChecks(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/checks/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  //区级督查核查
  postInsChecks(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/ins-checks/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  //打卡签到
  postSignIn(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/signin/",
          "urlKey": "govWechat",
          "params": data
      });
  }
  //打卡签到列表
  getSignIn(strWhere) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "user/signins/",
          "urlKey": "govWechat",
          "params": strWhere
      });
  }
  //打卡签到列表
  getSignInV2(strWhere) {
      return this.requestData({
          "methodType": "get",
          "methodName": "api/v2/user/signins/",
          "urlKey": "govWechat",
          "params": strWhere
      });
  }
  // 获取每天打卡的次数
  getSignDate(data) {
      return this.requestData({
          "methodType": "get",
          "methodName": "api/v2/user/signin-date",
          "urlKey": "govWechat",
          "params": data
      });
  }

  // 是否自动签到
  putSignWay(AutoCheckWork) {
      return this.requestData({
          "methodType": "put",
          "methodName": this.base + "user/signin-way",
          "urlKey": "govWechat",
          "params": {
              "AutoCheckWork": AutoCheckWork
          }
      });
  }
  //获取人员最新点位
  getCurrentLocation(data) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "user/current-location",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 物码QRcode
  getInfoByQrCode(qrcode) {
      return this.requestData({
          "methodType": "post",
          "methodName": "wm/wm/qrcode",
          "urlKey": "wmUrl",
          "params": {
              qrcode
          }
      });
  }
  // 物码大小类
  getWMClassSelect(classCode) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "object-classes",
          "urlKey": "govWechat",
          "params": {
              classCode
          }
      });
  }
  // 协同申请
  postSynergys(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/synergys/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 误报接口
  postMisReport(params, taskId) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/solves/misreport/" + taskId,
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 获取协同人员
  getSynergysUers(taskid) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "user/synergys/" + taskid + "/users",
          "urlKey": "govWechat",
          "params": {}
      });
  }
  // 协同审核
  postSynergysChecks(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/synergys/checks/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 获取是否展示兴趣点
  getPoiCodeShow() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "sysconfigs/0734",
          "urlKey": "govWechat",
          "params": {}
      });
  }
  // 获取兴趣点
  getPoiCodeList() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "codes/pois",
          "urlKey": "govWechat",
          "params": {
              "poiType": "12"
          }
      });
  }
  // 评价
  postEvaluation(taskId, data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + `user/${taskId}/evaluation`,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 获取特定类型的参数项
  getCodes(type, sourceId) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "codes/" + type,
          "urlKey": "govWechat",
          "params": {
              sourceId
          }
      });
  }
  // 根据ServiceType获取下拉框列
  getOptByServiceType(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "codes/facts",
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 获取自动派遣部门信息
  getAutoDispatchDept() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "resources/streets",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 城地更新图层接口
  postUpdateMap(objectId) {
      /* const formData = new FormData();

      formData.append("f", "pjson");
      formData.append("features", JSON.stringify([
          {
              "attributes": {
                  "OBJECTID_1": objectId,
                  "状态": "0"
              }
          }
      ]
      )); */
      const data = {
          "f": "pjson",
          "features": JSON.stringify([
              {
                  "attributes": {
                      "OBJECTID_1": Number(objectId),
                      "状态": "1"
                  }
              }
          ])
      };

      return this.requestData({
          "methodType": "post",
          "methodName": "/updateFeatures",
          "urlKey": "updateMapUrl",
          "params": qs.stringify(data),
          // params: formData,
          "headers": {
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
          }
      });
  }
  // h5登陆接口
  postH5Login(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/login",
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 一线通达案件列表
  postYXTDList(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.basev3 + "list",
          "urlKey": "yxtdUrl",
          "params": qs.stringify(data),
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 一线通达详情
  postCaseDetail(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.basev3 + "detail",
          "urlKey": "yxtdUrl",
          "params": qs.stringify(data),
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 一线通达案件统计
  getCountProcess(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.basev3 + "count",
          "urlKey": "yxtdUrl",
          "params": qs.stringify(data),
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 一线通达处置
  postYXTDSave(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.basev3 + "save",
          "urlKey": "yxtdUrl",
          "params": data
      });
  }
  // 一线通达接单
  postYXTDAccept(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.basev3 + "accept",
          "urlKey": "yxtdUrl",
          "params": data
      });
  }
  // 一线通达退出登陆
  postYXTDLogOut(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.basev3 + "logout",
          "urlKey": "yxtdUrl",
          "params": data
      });
  }

  // 获取第三方用户信息
  getUserIdByToken(token) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/jd/context",
          "urlKey": "wxConfing",
          "params": {
              token
          }
      });
  }
  // 获取第三方用户信息
  getUserInfoById(userId) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/jd/user",
          "urlKey": "wxConfing",
          "params": {
              userId
          }
      });
  }
  // 用户认证
  getYJToken(openid) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/login/login",
          "urlKey": "yjUrl",
          "params": {
              "openid": ""
          }
      });
  }
  // 提交图片 groupName 四种，report 上报和核实，check核查 ，disposition处置，other其他
  postResource(fileList, groupName) {
      const formData = new FormData(),
          list = [];

      fileList.forEach((file, index) => {
          formData.append("aaa" + index, file);
      });
      console.log(groupName, fileList);

      return new Promise((resolve) => {
          this.requestData({
              "methodType": "post",
              "methodName": "resource",
              "urlKey": "mediaUrl",
              "params": formData
          }).then((fileData) => {
              fileData.forEach((data) => {
                  list.push({
                      "fileId": data.id,
                      "fileName": data.name,
                      "filePath": data.path,
                      "fileExtension": "",
                      "fileSize": "",
                      "fileGroup": groupName
                  });
              });
              for (let i = 0; i < list.length; i++) {
                  fileList.forEach(({ name, type, size }) => {
                      if (name === list[i].fileName) {
                          list[i].fileExtension = type.split("/")[1];
                          list[i].fileSize = size;
                      }
                  });
              }
              console.log(list);
              resolve(list);
          });
      });
  }
  // 附件url
  postResourceUrl(url) {
      return this.requestData({
          "methodType": "post",
          "methodName": "exchange",
          "urlKey": "mediaUrl",
          "params": {
              url
          }
      });
  }
  //提交录音文件 后台处理
  postMediaVoice(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "media-voice",
          "urlKey": "wxConfing",
          "params": params
      });
  }
  //提交录音文件 后台处理
  postMediaVoiceWX(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "wx-media-voice",
          "urlKey": "wxConfing",
          "params": params
      });
  }
  //提交录音文件 后台处理
  postMediaVoiceSSB(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "ssb/media-voice",
          "urlKey": "wxConfing",
          "params": params
      });
  }
  //提交视频文件 后台处理
  postMediaVideo(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "media-video",
          "urlKey": "wxConfing",
          "params": params
      });
  }
  //提交录音文件 后台处理
  postMediaVoiceCM(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "media-voice",
          "urlKey": "voiceUrl",
          "params": params
      });
  }
  // 根据id获取图片
  getResource(id) {
      return this.requestData({
          "methodType": "get",
          "methodName": "resource/" + id,
          "urlKey": "mediaUrl",
          "params": {}
      });
  }
  // 获取用户九宫格菜单
  getUserMenu(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user/applications",
          "urlKey": "govWechat",
          params
      });
  }
  // 登陆获取toke
  postLogin(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": "userInfo/login",
          "urlKey": "dataApi",
          "params": data,
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 获取事项占比
  getEventPercent(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getdata/cgdata/PRO_WX_GETSTREETSXZB",
          "urlKey": "dataApi",
          params
      });
  }
  // 街道各处置部门处置数量
  getDepartmentHandleNum(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getdata/cgdata/PRO_WX_GETSTREETCZSL",
          "urlKey": "dataApi",
          params
      });
  }
  // 获取今日案件数
  getCaseNum(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getdata/cgdata/PRO_WX_GETSTREETJRAJ",
          "urlKey": "dataApi",
          params
      });
  }
  // 获取今日发现 | 今日回复 |获取月工单量 | 获取12345案件列表 | 部门接单情况 | 部门处置情况 | 累计在办+即将超期
  getDataByName(methodName, params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getdata/cgdata/PRO_WX_GETSTREET12345" + methodName,
          "urlKey": "dataApi",
          params
      });
  }
  // 获取责任网格
  getWorkGrid(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getdata/cgdata/PRO_WX_GETWORKGRID",
          "urlKey": "dataApi",
          params
      });
  }
  // 问题上报
  postReport(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/report",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 分管领导
  getLeaders(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "command-dispatches/leaders",
          "urlKey": "govWechat",
          params
      });
  }
  // 主责部门 从责部门
  getDepartments(params) {
      return this.requestData({
          "methodType": "get",
          "methodName":
        this.base + "command-dispatches/" + params.taskid + "/departments",
          "urlKey": "govWechat",
          params
      });
  }
  // 发起指挥
  PostCommandDispatch(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "tasks/" + data.taskid + "/command-dispatch",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 开启设备摄像头
  getOpenDevice(deviceId) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/stream/" + deviceId,
          "urlKey": "deviceApi",
          "params": null
      });
  }
  // 开启设备摄像头
  closeDevice(deviceId) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/stream/opt/close/" + deviceId,
          "urlKey": "deviceApi",
          "params": null
      });
  }
  // 获取设备的播放地址
  getDevicePlayer(deviceId) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/player/" + deviceId,
          "urlKey": "deviceApi",
          "params": null
      });
  }
  // 获取特殊标签
  getSpecialTag(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "codes/sources/032",
          "urlKey": "govWechat",
          "params": params
      });
  }
  // 获取指挥消息
  getCommandMessages(taskid) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/" + taskid + "/command-messages",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 查询案件办理进度
  getCommandProgresses(taskid) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/" + taskid + "/command-progresses",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 指挥
  postCommandMessage(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "tasks/" + data.taskid + "/command-message",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 一体化指挥接单
  putCommandTask(data) {
      return this.requestData({
          "methodType": "put",
          "methodName": this.base + "user/command-takes/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 获取派遣协办部门列表（不包含已派遣的）
  getAssistantDepartments(taskid) {
      return this.requestData({
          "methodType": "get",
          "methodName":
        this.base + "command-dispatches/" + taskid + "/assistant-departments",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 根据任务号获取转派人员
  getCommandUsers(params) {
      return this.requestData({
          "methodType": "get",
          "methodName":
        this.base + "tasks/" + params.taskid + "/transfer/command-users",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 提处置派单(手机再派遣 （协办）)
  postCommandReDispatch(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "tasks/" + data.taskid + "/command-redispatch",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 提交派单
  postCommandTransfer(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "tasks/" + data.taskid + "/command-transfer",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 现场签到
  postCommandSignin(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "user/command-signin",
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 处理反馈
  postCommandSolves(data) {
      return this.requestData({
          "methodType": "put",
          "methodName": this.base + "user/command-solves/" + data.taskid,
          "urlKey": "govWechat",
          "params": data
      });
  }
  // 获取快速查询条件
  getQuickQueryList(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/menu-options",
          "urlKey": "govWechat",
          params
      });
  }
  // 获取消息列表
  getMessageList(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": "message/read/pageList/e75932bb92904defa98e13a8aad88888",
          "urlKey": "messageApi",
          params
      });
  }
  // 通过ID精准查询消息
  getMessageById(id) {
      return this.requestData({
          "methodType": "get",
          "methodName": `message/read/${id}/e75932bb92904defa98e13a8aad88888`,
          "urlKey": "messageApi",
          "params": null
      });
  }
  // 修改消息状态
  updateMessageStatus(id) {
      return this.requestData({
          "methodType": "put",
          "methodName": `message/read/${id}`,
          "urlKey": "messageApi",
          "params": {
              "isRead": "1"
          }
      });
  }
  // 获取管理提示
  getMessageTipStatistics() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user/management-tip-statistics",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 获取嘉定的token
  getJDToken() {
      return this.requestData({
          "methodType": "get",
          "methodName": "auth/login",
          "urlKey": "thirdUrl",
          "params": {
              "username": "",
              "password": ""
          }
      });
  }
  // 获取工单列表
  getJDList(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": "author/conch/department/smallWorkObj/searchBySg",
          "urlKey": "thirdUrl",
          params
      });
  }
  // 获取管理提示列表
  getMessageTips(params) {
      /* {
            messageType: '',
            StartTime: '',
            EndTime: '',
            Type: '', // 1 已读 0未读 不传为所有
        } */
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user/management-tips",
          "urlKey": "govWechat",
          params
      });
  }
  // 获取具体的管理提示信息
  getManagementTips(id) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user/management-tips/" + id,
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 消息已读接口
  putManagementTips(id) {
      return this.requestData({
          "methodType": "put",
          "methodName": this.base + "/user/management-tips/" + id,
          "urlKey": "govWechat",
          "params": {}
      });
  }
  // 批量催办消息
  postUrgeMessages() {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "/tasks/urge-messages",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 领导获取处置中案件
  getSolvings(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user​/solvings",
          "urlKey": "govWechat",
          params
      });
  }
  postReward(data, taskId) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + `/user/solves/${taskId}/reward`,
          "urlKey": "govWechat",
          "params": data
      });
  }
  //根据手机号获取token
  postMobileToken(mobileNo) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "mobile-token",
          "urlKey": "govWechat",
          "params": {
              "mobileNo": mobileNo
          }
      });
  }
  // 获取第三方应用
  getExternalApplications() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user/external-applications",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 认证菜鸟政务通
  getCertUrl() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "/user/external-applications",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 获取我的案件token
  getStatisticsToken(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": "token",
          "urlKey": "esUrl",
          "params": data,
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 获取固定周期数据
  getStatValueByCycle(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "api/statValueByCycle/json",
          "urlKey": "esUrl",
          "params": params,
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 获取指定周期数据
  getStatValueByTime(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "api/statValueByTime/json",
          "urlKey": "esUrl",
          "params": params,
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 统计字段定义接口
  getStatTargetDefine(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "api/statTargetDefine/json",
          "urlKey": "esUrl",
          "params": params,
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 统计用户核实核查、处置接口
  getStatUserOperateLog(params) {
      return this.requestData({
          "methodType": "get",
          "methodName": "api/statUserOperateLog/json",
          "urlKey": "esUrl",
          "params": params,
          "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
          }
      });
  }
  // 获取案件办理进度
  getProcessing(taskid) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/" + taskid + "/progresses",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // 获取区级督查案件办理进度
  getProcessingForIns(taskid) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/" + taskid + "/ins-progresses",
          "urlKey": "govWechat",
          "params": null
      });
  }
  // wgs84转城建坐标
  getCoordByLngLat(data) {
      return this.requestData({
          "methodType": "get",
          "methodName": "wgs-cj",
          "urlKey": "wxConfing",
          "params": {
              "x": data.x,
              "y": data.y
          }
      });
  }
  //城建坐标转 wgs84
  getCoordByXY(coordInfo) {
      return this.requestData({
          "methodType": "get",
          "methodName": "cj-wgs",
          "urlKey": "wxConfing",
          "params": {
              "x": coordInfo.x,
              "y": coordInfo.y
          }
      });
  }
  //城建坐标获取地址
  getAddressByXY(coordInfo) {
      return this.requestData({
          "methodType": "get",
          "methodName": "address",
          "urlKey": "wxConfing",
          "params": {
              "x": coordInfo.x,
              "y": coordInfo.y
          }
      });
  }
  //批量上传坐标标
  postTrajectorys(coordArray) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "trajectorys",
          "urlKey": "govWechat",
          "params": {
              "trajectories": coordArray
          }
      });
  }

  // 错误日志
  postErrorLog() {
      //   return this.requestData({
      //       "methodType": "post",
      //       "methodName": this.base + "logs",
      //       "urlKey": "govWechat",
      //       "params": params
      //   });
  }

  // 获取首页统计
  getTodoStatistics() {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "user/todo-statistics",
          "urlKey": "govWechat"
      });
  }

  getMyReport(time) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/self-report-statistics",
          "urlKey": "govWechat",
          "params": time
      });
  }
  getMyReportClass(time) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/self-report-class-statistics",
          "urlKey": "govWechat",
          "params": time
      });
  }

  getMyComplete(time) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.base + "tasks/self-complete-statistics",
          "urlKey": "govWechat",
          "params": time
      });
  }

  getSigninStatistics(time) {
      return this.requestData({
          "methodType": "get",
          "methodName": this.basev2 + "user/signin-statistics",
          "urlKey": "govWechat",
          "params": time ? time : {}
      });
  }

  //获取ES数据
  getESData(params) {
      return this.requestData({
          "methodType": "post",
          "methodName": this.base + "elastic/statistics",
          "urlKey": "govWechat",
          "params": params
      });
  }

  postLoginByShGrid(phone) {
      return this.requestData({
          "methodType": "get",
          "methodName": `${phone}`,
          "urlKey": "areaUrl",
          "params": null
      });
  }

  surveyLogin(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/mobile/login",
          "urlKey": "surveyUrl",
          "params": option
      });
  }
  surveyGetUser() {
      return this.requestData({
          "methodType": "get",
          // "methodName": "/citygrid-web/v2/user",
          "methodName": store.getters["app/appConfig"].account ? "/citygrid-web/account" : "/citygrid-web/v2/user",
          "urlKey": "surveyUrl",
          "params": ""
      });
  }
  surveyList(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/listByUser",
          "urlKey": "surveyUrl",
          "params": option,
          "isData": true
      });
  }
  surveyVerifyList(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/verify/list",
          "urlKey": "surveyUrl",
          "params": option
      });
  }
  surveyVerify(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/verify/complate",
          "urlKey": "surveyUrl",
          "params": option,
          "isData": true
      });
  }
  surveyDetail(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/get",
          "urlKey": "surveyUrl",
          "params": option,
          "isNeedPhone": true
      });
  }
  saveSurveyData(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/data/save",
          "urlKey": "surveyUrl",
          "params": option,
          "isData": true
      });
  }
  getSurveyData(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/data/get",
          "urlKey": "surveyUrl",
          "params": option,
          "isNeedPhone": true
      });
  }
  getSurveyDataChart(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/data/chart",
          "urlKey": "surveyUrl",
          "params": option,
          "isNeedPhone": true
      });
  }
  surveyDataList(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/data/list",
          "urlKey": "surveyUrl",
          "params": option,
          "isNeedPhone": true
      });
  }
  getFormMeta(option) {
      return this.requestData({
          "methodType": "post",
          "methodName": "/survey-service/survey/getFormMeta",
          "urlKey": "surveyUrl",
          "params": option,
          "isNeedPhone": true
      });
  }
  getStreets(option) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/citygrid-web/streets",
          "urlKey": "surveyUrl",
          "params": option
      });
  }
  getCommunities(option) {
      return this.requestData({
          "methodType": "get",
          "methodName": "/citygrid-web/communities",
          "urlKey": "surveyUrl",
          "params": option
      });
  }
  // 虹桥镇移动端近期预警接口
  getStaticalData() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/g67kr8belz",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133323538393733393533",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133323538393733393533"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "5feafa32319d4b58b36dfdb5602a0530"
          }
      });
  }
  //虹桥镇移动端绩效分析接口
  getStaticalData2() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/rk2at1bd2a",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133323538393736323838",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133323538393736323838"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "10667091ed2448e898650eeeea58738f"
          }
      });
  }
  //虹桥镇移动端总体分析八率接口
  getStaticalData3() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/4t62ebibzu",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133323538393731323238",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133323538393731323238"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "6dee13420afc481f9e3afd5050b93742"
          }
      });
  }
  //虹桥镇移动端总体分析处置情况接口
  getStaticalData4() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/4nhveuu5b5",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133323538393638323136",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133323538393638323136"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "5d6ba90c895947d090cccbedb23203ce"
          }
      });
  }
  //虹桥镇移动端集中高发明细接口
  getStaticalData5() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/lb67b0so6b",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133353036353434373737",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133353036353434373737"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "MC": "7天"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "3e75d61eebf6463daf33694acf04937f"
          }
      });
  }
  //虹桥镇热点Top10接口
  getTop10() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/5dafkxtlw3",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a31363336323739303838373939313636343635",
              "accessPwd": "7077643a31363336323739303838373939313636343635"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "id": "3",
                      "PEXECUTEDEPTCODE_MH": "20108"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "0"
              },
              "apiId": "6c4049279e9642d8baf85d0e1eaaebb5"
          }
      });
  }
  //热点top10详情
  getTop10Detail(name) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/bqsldt35uo",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373139323137393338383736",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373139323137393338383736"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "INFOSCNAME": name
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "129147ece1f54b7cb272c493065dcfd6"
          }
      });
  }
  // 闵行区移动端近期预警接口
  getStaticalData6() {
      return this.requestData({
          "methodType": "post",
          "methodName": "mhqjk/4bmji3suut",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133393235353531393037",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133393235353531393037"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "15180a5b793c4ef0a931d6aafd62c0e7"
          }
      });
  }
  // 闵行区移动端热线指标五率接口
  getStaticalData7() {
      return this.requestData({
          "methodType": "post",
          "methodName": "mhqjk/pot9mxk66h",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133393235353438373134",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133393235353438373134"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "0589001bed004f98b950c845d90d6d29"
          }
      });
  }
  // 闵行区移动端工单量接口
  getStaticalData8() {
      return this.requestData({
          "methodType": "post",
          "methodName": "mhqjk/3kd5q1yq49",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373133393235353435343932",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373133393235353435343932"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "27ed0a5aee7340ec8686e73e86111e8d"
          }
      });
  }
  // 虹桥镇移动端总体分析处置情况明细接口
  getStaticalData9(type = "月") {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/bnz5df4bt5",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373330383630343030373430",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373330383630343030373430"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "LX": type
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "4dad089f4fe24b3d82e67906914dfe52"
          }
      });
  }
  // 虹桥镇移动端近期预警明细接口
  getStaticalData10(type = "15") {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/ndlns8wbgb",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373330383630333936383837",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373330383630333936383837"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "LX": type
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "ac65ea602aad41818b217eb40f10ced6"
          }
      });
  }
  // 虹桥镇移动端绩效主动上报分析接口
  getStaticalData11() {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/ksx6rs2bb1",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373331303537363232353134",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373331303537363232353134"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "ID": "1"
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "bf0af4749a904aaf9e314174efa5f988"
          }
      });
  }
  // 虹桥镇部门移动端近期预警接口
  getStaticalData12(deptCode) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/t0q0jy0ha0",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332303838383734313232",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332303838383734313232"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "9575b19ab9814014a6de50ef381a9c13"

          }
      });
  }
  // 虹桥镇部门移动端总体分析八率接口
  getStaticalData13(deptCode) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/70o1db34ub",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332303838383638303536",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332303838383638303536"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "1cb4843f6343462ba7f79ee2d3d2ae04"
          }
      });
  }
  // 虹桥镇部门移动端总体分析处置情况接口
  getStaticalData14(deptCode) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/021qz2y3vg",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332303838383835303533",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332303838383835303533"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "e9803b8ea68940c1a3d2d3ae900f2c81"
          }
      });
  }
  // 虹桥镇部门移动端热点TOP10接口
  getStaticalData15(deptCode) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/fxq4ljexnw",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332303838383739373030",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332303838383739373030"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "bc0a682fabc14fcd9face32808bb0669"
          }
      });
  }
  // 虹桥镇部门移动端总体分析处置情况明细接口
  getStaticalData16(deptCode, type = "月") {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/pbwo9f5wpv",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332363033333639363934",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332363033333639363934"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode,
                      "LX": type
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "feaf14b0375848af9ca4aca27f7e2588"
          }
      });
  }
  // 虹桥镇部门移动端近期预警明细接口
  getStaticalData17(deptCode, type = "15") {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/ym2brg0kw9",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332363033333635353034",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332363033333635353034"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode,
                      "LX": type
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "4a06abe783074b37966798c3a1c0c78b"
          }
      });
  }
  // 虹桥镇部门移动端集中高发明细接口
  getStaticalData18(deptCode) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/hj62hfpsim",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332363033333539393638",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332363033333539393638"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "BM": deptCode
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "6062c7ab41a04e69b52faa9acbcb9763"
          }
      });
  }
  // 虹桥镇部门移动端热点TOP10明细接口
  getStaticalData19(deptCode, infoSourceName) {
      return this.requestData({
          "methodType": "post",
          "methodName": "hqjk/jwrvdt9tqu",
          "urlKey": "staticalApi",
          "headers": {
              "Content-Type": "application/json",
              "accessKey": "6b65793a3136333632373930383837393931363634363531373332363034383734333134",
              "accessPwd": "7077643a3136333632373930383837393931363634363531373332363034383734333134"
          },
          "params": {
              "param": {
                  "fieldMap": {
                      "INFOSCNAME": infoSourceName,
                      "BM": deptCode
                  }
              },
              "pageParams": {
                  "limit": "10",
                  "page": "1"
              },
              "apiId": "54b1c71a0655418294bfcca87bec36b3"
          }
      });
  }
  // 部件采集上报
  postComponentSave(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": "save",
          "urlKey": "bjcjUrl",
          "params": data

      });
  }
  // 部件采集查询
  getComponentByQuery(data) {
      return this.requestData({
          "methodType": "post",
          "methodName": "query",
          "urlKey": "bjcjUrl",
          "params": data
      });
  }
  // 部件采集查询
  getComponentById(id) {
      return this.requestData({
          "methodType": "get",
          "methodName": "get",
          "urlKey": "bjcjUrl",
          "params": {
              id
          }
      });
  }
  // 部件采集删除
  deleteComponent(id) {
      return this.requestData({
          "methodType": "delete",
          "methodName": "delete",
          "urlKey": "bjcjUrl",
          "params": { id }
      });
  }
  // 部件采集删除文件
  deleteComponentFile(id) {
      return this.requestData({
          "methodType": "delete",
          "methodName": "deleteFile",
          "urlKey": "bjcjUrl",
          "params": { id }
      });
  }

  //金山综治上报
  postJSThirdReport(thirdFormData) {
      console.log(thirdFormData);

      let formData = new FormData();

      formData.append("mobilePhone", thirdFormData.mobilePhone);
      formData.append("actionType", thirdFormData.actionType);
      formData.append("actionTypeId", thirdFormData.actionTypeId);
      formData.append("actionSort1", thirdFormData.actionSort1);
      formData.append("actionSort2",thirdFormData.actionSort2);
      formData.append("actionSort3", thirdFormData.actionSort3);
      formData.append("content", thirdFormData.content);
      formData.append("actionPlace", thirdFormData.actionPlace);
      formData.append("latitude", thirdFormData.latitude);
      formData.append("longitude", thirdFormData.longitude);
      formData.append("actionDate", String(thirdFormData.actionDate));

      thirdFormData.file.forEach((file) => {
          console.log(file);
          console.log(file.name);
          formData.append("file", file);
      });
      console.log(formData);
      return this.requestData({
          "methodType": "post",
          "methodName": "saveFile",
          "urlKey": "zzListUrl",
          "params": formData
      });
  }

  //金山综治token
  getJSThirdReportToken(mobilePhone) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getToken",
          "urlKey": "zzListUrl",
          "params": {
              mobilePhone
          }
      });
  }
  //金山综治上报列表
  getJSThirdReportList(data) {
      return this.requestData({
          "methodType": "get",
          "methodName": "list",
          "urlKey": "zzListUrl",
          "params": {
              "mobilePhone": sessionStorage.getItem("phone"),
              ...data
          }
      });
  }
  //金山综治上报数字
  getJSThirdReportNum(data) {
      return this.requestData({
          "methodType": "get",
          "methodName": "getEventNum",
          "urlKey": "zzListUrl",
          "params": {
              "mobilePhone": sessionStorage.getItem("phone"),
              ...data
          }
      });
  }

  requestData(option) {
      return new Promise((resolve, reject) => {
          requestFn
              .init(option)
              .then((res) => {
                  if (res.status === 200) {
                      if (String(res.data.code) === "200" && res.data.data) {
                          if (option.methodName === "api/v1/elastic/statistics") {
                              res.data.data.json = ESDataFormat(res.data.data);
                              resolve(res.data.data);
                          } else {
                              resolve(res.data.data);
                          }
                      } else if (((String(res.data.code) === "000000" || String(res.data.code) === "210") && res.data.data)) {
                          resolve(res.data.data);
                      } else if (String(res.data.code) === "500" || String(res.data.code) === "501") {
                          reject(res.data.message);
                      } else if(String(res.data.code) === "0" ){
                          resolve(res.data);
                      } else {
                          resolve(res.data);
                      }
                  } else {
                      reject(res.data.message || res.data.msg);
                  }
              })
              .catch((err) => {
                  reject(err);
              });
      });
  }
}
