import Vue from "vue";
import dayjs from "dayjs";
import {
    getPlatFormType,
    getApiFactory
} from "./platForm.js";
import store from "@/store";
import router from "@/router";
import Vconsole from "vconsole";
import { getSMYSign } from "./getSMYSign.js";

const app = {
    "appId": "",
    "agentId": "",
    "thirdType": "",
    "userId": "",
    "code": "",
    "weappAppId": "",
    "weappAppSecret": "",
    "redirect": "",
    "corpId": "",
    "zwAppId": "",
    "zwAppSecret": "",
    "isZw": "0"
};

export function initMethodFactory(thirdType) {
    Vue.prototype.$methodFactory = new getPlatFormType(thirdType);
}

export function initApiFactory(interfaceType) {
    Vue.prototype.$apiFactory = new getApiFactory(interfaceType);
}

function redirectError(redirect, message) {
    router.push({
        "path": redirect,
        "query": {
            "message": Vue.prototype.$encrypt(message)
        }
    });
}

function getSurveyUser() {
    return new Promise((resolve, reject) => {
        Vue.prototype.$apiFactory
            .surveyGetUser()
            .then((res) => {
                store.state.user.surveyUserId = res.userId;
                resolve();
            })
            .catch(() => {
                reject();
            });
    });
}

function surveyLogin() {
    return new Promise((resolve, reject) => {
        Vue.prototype.$apiFactory
            .surveyLogin({
                "mobile": sessionStorage.getItem("phone")
            })
            .then(async (res) => {
                store.state.user.surveyToken = res.access_token;
                store.state.user.baseToken = res.baseToken;
                await getSurveyUser();
                resolve();
            })
            .catch(() => {
                reject();
            });
    });
}

function getZZToken() {
    Vue.prototype.$apiFactory
        .getJSThirdReportToken(sessionStorage.getItem("phone"))
        .then((res) => {
            sessionStorage.setItem("zzToken", res.token);
        });
}
export function getQueryString(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
        result = window.location.search.substring(1).match(reg);

    if (result !== null) {
        return decodeURIComponent(result[2]);
    }
    return null;
}

function writeLog(log) {
    console.log(log + ":" + dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"));
}

export function isYJ() {
    return process.env.NODE_ENV === "mhyj";
}

export function hasYXTD() {
    return (
        sessionStorage.getItem("YWtoken") === "undefined" &&
    sessionStorage.getItem("wxLoginToken")
    );
}

function hasYXTDAndZWWX() {
    return (
        sessionStorage.getItem("YWtoken") !== "undefined" &&
    sessionStorage.getItem("wxLoginToken")
    );
}

function login() {
    return Vue.prototype.$methodFactory.login({
        "appId": app.appId,
        "agentId": app.agentId,
        "appSecret": app.appSecret,
        "userId": app.userId,
        "code": app.code,
        "weappAppId": app.weappAppId,
        "weappAppSecret": app.weappAppSecret,
        "corpId": app.corpId,
        "zwAppId": app.zwAppId,
        "zwAppSecret": app.zwAppSecret,
        "zwAgentId": app.zwAgentId,
        "isZw": app.isZw,
        "invokeAppId": app.invokeAppId,
        "invokeAppSecret": app.invokeAppSecret,
        "hasWorkPhoneChoice": app.hasWorkPhoneChoice || false
    });
}

function handleUserTime(opt, next) {
    if (store.getters["app/appConfig"].nav.zxdc) {
        surveyLogin();
    }
    if (process.env.NODE_ENV === "js") {
        getZZToken();
    }
    const query = opt;

    query.menuId = app.redirect;
    next({
        "path": "/" + opt.redirect,
        query
    });
}

function initConsole(phone) {
    if (
        store.getters["app/appConfig"].hasConsole &&
    store.getters["app/appConfig"].hasConsole.includes(phone)
    ) {
        /* eslint-disable-next-line */
        new Vconsole();
    }
}

function getYJToken(phone) {
    if (isYJ()) {
        Vue.prototype.$apiFactory.getYJToken(phone).then((token) => {
            sessionStorage.setItem("yjToken", token);
        });
    }
}

function loginAndSetUserInfo(phone, opt, next) {
    Vue.prototype.$apiFactory.postMobileToken(phone).then((res) => {
        console.log(res);
        sessionStorage.setItem("userInfo", JSON.stringify(res));
        store.commit("user/SET_USER_ALL", res);
        Vue.prototype.$mitt.emit("getUseName", {"userName": res.userName, "type": opt.type });
        handleUserTime(opt, next);
    });
}

function isTel(phone) {
    return /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(phone);
}

export function phoneFilter(str) {
    return str.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

function initForWork(opt, next, phone) {
    initConsole(phone);
    localStorage.setItem("lastChoicePhone", phone);
    sessionStorage.setItem("phone", phone);
    loginAndSetUserInfo(phone, opt, next);
}

function othersGetUerInfo(isAuthPage, opt, next) {
    if (isAuthPage) {
        const phone = sessionStorage.getItem("phone");

        initConsole(phone);
        getYJToken(phone);
        loginAndSetUserInfo(phone, opt, next);
    } else {
        login().then((phone) => {
            initConsole(phone);
            getYJToken(phone);
            writeLog("获取用户时间");

            //为空直接关闭
            if (!Vue.prototype.$isNullOrUndefined(phone)) {
                // this.$methodFactory.closeWindow();
            } else {
                sessionStorage.setItem("phone", phone);
            }
            loginAndSetUserInfo(phone, opt, next);
        });
    }
}

function onlyYXTD(isAuthPage, opt, next) {
    login().then((phone) => {
        initConsole(phone);
        sessionStorage.setItem("phone", phone);
        handleUserTime(opt, next);
    });
}

function weappGetUserInfo(isAuthPage, opt, next) {
    login().then((phone) => {
        initConsole(phone);
        getYJToken(phone);
        loginAndSetUserInfo(phone, opt, next);
    });
}

function otherZwGetUserInfo(isAuthPage, opt, next) {
    login().then((phone) => {
        // 浦东随身办环境下需要切换工作手机和注册手机
        if(typeof phone === "string") {
            initConsole(phone);
            sessionStorage.setItem("phone", phone);
            loginAndSetUserInfo(phone, opt, next);
        } else if (typeof phone === "object" && (phone.mobile === phone.workPhone || !isTel(phone.workPhone))) {
            // 默认如果工作手机为null 则使用注册号码 或者 工作手机和注册手机一致的话，直接使用注册号码
            initConsole(phone.mobile);
            sessionStorage.setItem("phone", phone.mobile);
            loginAndSetUserInfo(phone.mobile, opt, next);
        } else {
            // 如果工作手机不为null并且不相等 是第一次没做提示的 给与其提示 让其选择何种方式登录
            if (isTel(phone.workPhone) && phone.mobile !== phone.workPhone && !localStorage.getItem("lastChoicePhone")) {
                // 点击进来后，如果发现注册号码和工作号码不一致，需要询问是按照哪个号码登录我们系统来确认身份。
                localStorage.setItem("phoneInfo", JSON.stringify({
                    "workPhone": phone.workPhone,
                    "mobile": phone.mobile
                }));
                Vue.prototype.$mitt.emit("showChangeAccountSheet", {
                    "actions": [
                        {
                            "name": `工作号码:${phoneFilter( phone.workPhone)}`,
                            "value": phone.workPhone
                        },
                        {
                            "name": `注册号码:${phoneFilter(phone.mobile)}`,
                            "value": phone.mobile
                        }
                    ],
                    "callBack": initForWork.bind(null, opt, next)

                });
            } else {
                // 如果以上情况都没有就使用缓存中的手机号登陆
                const phone = localStorage.getItem("lastChoicePhone");

                initConsole(phone);
                sessionStorage.setItem("phone", phone);
                loginAndSetUserInfo(phone, opt, next);
            }

        }

    });
}

function ptGetUserInfo(isAuthPage, opt, next) {
    // 我们嵌入第三方的页面 (普陀环境)
    const api = Vue.prototype.$apiFactory;

    if (opt.biz_param) { // 通过随身办消息进入
        api.getUserPhoneByToken(opt.token)
            .then(res => res.mobile)
            .then((phone) => {
                initConsole(phone);
                if (opt.type === "ssb") {
                    sessionStorage.setItem("isSSb", "1");
                }
                sessionStorage.setItem("phone", phone);
                login().then(() => {
                    loginAndSetUserInfo(phone, opt, next);
                });
            });
    } else {
        api.getUserIdByToken(opt.token)
            .then((data) => data.user.id)
            .then((userId) => {
                api.getUserInfoById(userId).then((userInfo) => {
                    const phone = userInfo.mobile;

                    initConsole(phone);
                    if (opt.type === "ssb") {
                        sessionStorage.setItem("isSSb", "1");
                    }
                    sessionStorage.setItem("phone", phone);
                    login().then(() => {
                        loginAndSetUserInfo(phone, opt, next);
                    });
                });
            });
    }
}

function mhGetUserInfo(isAuthPage, opt, next) {
    // 闵行随身办
    const api = Vue.prototype.$apiFactory;

    api.getAccessTokenByTicket(opt.ticket)
        .then((res) => {
            return {
                "accessToken": res.data.accessToken,
                "identity": res.data.identity
            };
        })
        .then(({
            accessToken,
            identity
        }) => {
            api.getUserInfoByAccessToken(accessToken, identity).then((userInfo) => {
                const phone = userInfo.data.person.mobile;

                initConsole(phone);
                sessionStorage.setItem("phone", phone);
                login().then(() => {
                    loginAndSetUserInfo(phone, opt, next);
                });
            });
        });
}

function sjGetUserInfo(isAuthPage, opt, next) {
    // 松江随申办
    const api = Vue.prototype.$apiFactory;

    api.sjGetAccessTokenByCode(opt.code)
        .then((data) => {
            console.log(data);
            return {
                "accessToken": data.access_token
            };
        })
        .then(({
            accessToken
        }) => {
            sessionStorage.setItem("sjAccessToken", accessToken);
            api.sjGetCustomByAccessToken(accessToken).then((data) => {
                console.log(data);
                const phone = data.custom.mobile;

                initConsole(phone);
                sessionStorage.setItem("phone", phone);
                login().then(() => {
                    loginAndSetUserInfo(phone, opt, next);
                });
            });
        });
}

function getSmyUserInfo(isAuthPage, opt, next) {
    const api = Vue.prototype.$apiFactory;

    if (app.code || sessionStorage.getItem("appCode")) {
        api.getSMYAccessToken({ "clientId": app.appId, "clientSecret": app.appSecret, "code": app.code || sessionStorage.getItem("appCode") }).then(res => {
            return {
                "clientId": app.appId,
                "clientSecret": app.appSecret,
                "accessToken": res.access_token,
                "useName": res.username
            };
        }).then(data => {
            api.getSMYUserId(data).then(res => {
                const phone = res.mobile;

                initConsole(phone);
                sessionStorage.setItem("phone", phone);
                login().then(() => {
                    loginAndSetUserInfo(phone, opt, next);
                });
            });
        });
    }
}

function getAppConfigAndSet(opt, next, isAuthPage, fn) {
    writeLog("项目启动");
    store
        .dispatch("app/getAppConfig", sessionStorage.getItem("mode"))
        .then(async () => {
            app.appId = store.getters["app/appConfig"].secrets.appId;
            app.agentId = store.getters["app/appConfig"].secrets.agentId;
            app.appSecret = store.getters["app/appConfig"].secrets.appSecret;
            app.corpId = store.getters["app/appConfig"].secrets.ddCorpId || "";
            app.thirdType = Vue.prototype.$isNullOrUndefined(opt.type) ?
                opt.type :
                "h5"; //判断接入平台 不传默认为h5
            app.userId = opt.userid || opt.userId;
            app.redirect = opt.redirect;
            app.code =
        opt.code || getQueryString("code") || getQueryString("authCode");
            store.commit("caseType/setMenuId", opt.menuId);
            let redirect,
                message,
                flag = true;
            const interfaceType = store.getters["app/appConfig"].interfaceType;

            switch (app.thirdType.toUpperCase()) {
                    case "ANDROID":
                        if (!Vue.prototype.$isNullOrUndefined(app.userId)) {
                            redirect = "error";
                            message = "ANDROID接入,userId必须传值!";
                            redirectError(redirect, message);
                            return;
                        }
                        sessionStorage.setItem("thirdAccessToken", opt.accessToken);
                        break;
                    case "H5":
                        console.log("TYPE");
                        //(when access method is H5 then userId must have)
                        if (!Vue.prototype.$isNullOrUndefined(app.userId)) {
                            redirect = "error";
                            message = "H5接入,userId必须传值!";
                            redirectError(redirect, message);
                            return;
                        }
                        if(process.env.VUE_APP_BASE_DISTRICT === "js") {
                            redirect = "error";
                            message = "没有权限";
                            redirectError(redirect, message);
                            return;
                        }
                        if (Number(opt.encrypt) === 1) {
                            app.userId = Vue.prototype.$decrypt(app.userId);
                        }
                        // 青浦环境下并且登陆的时候没有开启加密
                        if (opt.userid.length > 11) {
                            app.userId = opt.userid = Vue.prototype.$decrypt(opt.userid);
                        }
                        break;
                    case "APP":
                        app.userId = Vue.prototype.$decrypt(app.userId);
                        break;
                    case "WX":
                        // console.log(encodeURIComponent(window.location));
                        //(when access method is WX and code is null  then redirect to oauth-url )
                        // eslint-disable-next-line no-case-declarations
                        // let location=window.location+"?timestamp="+ new Date().getTime()+Math.random();

                        if (!Vue.prototype.$isNullOrUndefined(app.code)) {
                            let oauthUrl =
              "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
              app.appId +
              "&redirect_uri=" +
              encodeURIComponent(window.location) +
              "&response_type=code&scope=snsapi_base&isZw=1&state=STATE#wechat_redirect";

                            console.log(oauthUrl);
                            location.href = oauthUrl;
                        }
                        break;
                    case "WEAPP":
                        app.weappAppId = store.getters["app/appConfig"].secrets.weappAppId;
                        app.weappAppSecret =
            store.getters["app/appConfig"].secrets.weappAppSecret;
                        if (opt.phone) {
                            sessionStorage.setItem("phone", opt.phone);
                        }
                        break;
                    case "SSB":
                        /* eslint-disable-next-line */
                        const key = store.getters["app/appConfig"].secrets.zwAppKey,
                            baseUrl = store.getters["app/appConfig"].urls[0].ythbgBaseUrl,
                            district = process.env.VUE_APP_BASE_DISTRICT;

                        app.zwAppId = store.getters["app/appConfig"].secrets.zwAppId;
                        app.zwAppSecret = store.getters["app/appConfig"].secrets.zwAppSecret;
                        app.zwAgentId = key;
                        app.hasWorkPhoneChoice = district === "pd";

                        if (district === "fx" || district === "pd"|| district === "yp"|| district === "js"||district === "cm"|| district === "sj"|| district === "bs") {
                            app.isZw = "1";
                            if (!Vue.prototype.$isNullOrUndefined(app.code)) {
                                let oauthUrl = baseUrl + key + "&redirectUrl=" +
                                    encodeURIComponent(window.location);

                                console.log(oauthUrl);
                                location.href = oauthUrl;
                            }
                        }

                        break;
                    case "SMY":
                        app.appId = store.getters["app/appConfig"].secrets.smyAppId;
                        app.appSecret = store.getters["app/appConfig"].secrets.smySecret;
                        app.invokeAppId = store.getters["app/appConfig"].secrets.invokeAppId;
                        app.invokeAppSecret = store.getters["app/appConfig"].secrets.invokeAppSecret;
                        if (!Vue.prototype.$isNullOrUndefined(app.code)) {
                            try {
                                const { timestamp, sign } = await getSMYSign(store.getters["app/appConfig"].urls[0].smyUrl, {"clientId": app.appId, "clientSecret": app.appSecret }),
                                    smyAuthUrl =
                                    `https://api.eshimin.com/newOauth/authorize?client_id=${app.appId}&response_type=authorization_code&scope=scope&redirect_uri=${encodeURIComponent(store.getters["app/appConfig"].urls[0].redirectUrl)}&timestamp=${timestamp}&sign=${sign}`;

                                location.href = smyAuthUrl;
                            } catch (ex) {
                                redirectError("error", "获取签名失败！");
                            }
                        } else {
                            sessionStorage.setItem("appCode", app.code);
                        }
                        break;
                    case "DD":
                        app.appId = store.getters["app/appConfig"].secrets.ddAppId;
                        app.agentId = store.getters["app/appConfig"].secrets.ddAgentId;
                        app.appSecret = store.getters["app/appConfig"].secrets.ddAppSecret;
                        break;
                    default:
                        break;
            }
            writeLog("接入平台判断");
            writeLog(app.redirect);
            console.log(window.location.href);

            try {
                if (!Vue.prototype.$isNullOrUndefined(app.redirect)) {
                    redirect = "error";
                    message = "未指定认证后的页面!";
                    redirectError(redirect, message);
                    return;
                }
            } catch (ex) {
                writeLog(ex);
            }
            console.log(router);
            //跳转页未不在已知路由中跳着到错误页

            if (!flag) {
                redirect = "error";
                message = "认证成功跳转的路由不存在!";
                redirectError(redirect, message);
                return;
            }
            initMethodFactory(app.thirdType.toUpperCase());
            initApiFactory(interfaceType);
            writeLog("前提条件检查完毕");
            //初始化接口
            fn(isAuthPage, opt, next, Boolean(opt.token));
        });
}

export function init(opt, next, isRequest = false) {
    console.log("init");

    console.log(opt);
    if (hasYXTD()) {
    // 如果只有一线通达的情况那么是不要请求达哥的接口的
        getAppConfigAndSet(opt, next, isRequest, onlyYXTD);
    } else if (hasYXTD() && hasYXTDAndZWWX()) {
    // 既有政务微信又有一线通达的权限
        getAppConfigAndSet(opt, next, isRequest, weappGetUserInfo);
    } else if (opt.token) {
    // 普陀接入第三方的
        getAppConfigAndSet(opt, next, isRequest, ptGetUserInfo);
    } else if (opt.type === "ssb") {
        const district = process.env.VUE_APP_BASE_DISTRICT;

        if (district==="mh") {
            // 随身办闵行
            opt.redirect = "home";
            getAppConfigAndSet(opt, next, isRequest, mhGetUserInfo);
        }
        if (district==="sj") {
            console.log("松江随申办");
            // 松江随申办
            opt.redirect = "home";
            getAppConfigAndSet(opt, next, isRequest, sjGetUserInfo);
        }


        if (district === "cn" || district === "hp" || district === "hk") {
            getAppConfigAndSet(opt, next, isRequest, othersGetUerInfo);
        } else {
            // 其他政务接入
            getAppConfigAndSet(opt, next, isRequest, otherZwGetUserInfo);
        }
    } else if (opt.type === "smy") {
        getAppConfigAndSet(opt, next, isRequest, getSmyUserInfo);
    } else {
    // 非普陀和奉贤其他区的
        getAppConfigAndSet(opt, next, isRequest, othersGetUerInfo);
    }
}

function getConfigAndLogin(opt, resolve, fn) {
    /* eslint-disable */
  if (Vue.prototype.hasOwnProperty('$methodFactory')) {
    resolve()
    return
  }
  store
    .dispatch("app/getAppConfig", sessionStorage.getItem("mode"))
    .then(() => {
      app.appId = store.getters['app/appConfig'].secrets.appId
      app.agentId = store.getters['app/appConfig'].secrets.agentId
      app.appSecret = store.getters['app/appConfig'].secrets.appSecret
      app.corpId = store.getters['app/appConfig'].secrets.ddCorpId || ''
      app.isZw = opt.ext || getQueryString('ext')
      app.thirdType = Vue.prototype.$isNullOrUndefined(opt.type) ?
        opt.type :
        'h5' //判断接入平台 不传默认为h5
      app.userId = opt.userid || opt.userId
      app.redirect = opt.redirect
      app.code = opt.state || getQueryString('state')
      if (opt.type === 'weapp') {
        app.weappAppId = store.getters['app/appConfig'].secrets.weappAppId
        app.weappAppSecret =
          store.getters['app/appConfig'].secrets.weappAppSecret
      } else if (opt.type === 'ssb') {
        app.zwAppId = store.getters['app/appConfig'].secrets.zwAppId
        app.zwAppSecret = store.getters['app/appConfig'].secrets.zwAppSecret
        app.hasWorkPhoneChoice = process.env.VUE_APP_BASE_DISTRICT === "pd";
      } else if (opt.type === 'smy') {
        app.appId = store.getters["app/appConfig"].secrets.smyAppId;
        app.appSecret = store.getters["app/appConfig"].secrets.smySecret;
        app.invokeAppId = store.getters["app/appConfig"].secrets.invokeAppId;
        app.invokeAppSecret = store.getters["app/appConfig"].secrets.invokeAppSecret;
      } else if (opt.type === 'dd') {
        app.appId = store.getters['app/appConfig'].secrets.ddAppId
        app.agentId = store.getters['app/appConfig'].secrets.ddAgentId
        app.appSecret = store.getters['app/appConfig'].secrets.ddAppSecret
      }
      // 青浦环境下并且登陆的时候没有开启加密
      if (opt.userid && opt.userid.length > 11) {
        app.userId = opt.userid = Vue.prototype.$decrypt(opt.userid);
      }
      store.commit("caseType/setMenuId", opt.menuId);
      const interfaceType = store.getters["app/appConfig"].interfaceType;

      initMethodFactory(app.thirdType.toUpperCase());
      initApiFactory(interfaceType);
      fn(opt, resolve);
    });
}

function othersFactory(opt, resolve) {
  const phone = localStorage.getItem("lastChoicePhone") || sessionStorage.getItem("phone");
  initConsole(phone);
  getYJToken(phone);
  Vue.prototype.$apiFactory
    .postMobileToken(phone)
    .then((res) => {
      console.log(res)
      store.commit('user/SET_USER_ALL', res)
      sessionStorage.setItem("userInfo", JSON.stringify(res));
      Vue.prototype.$mitt.emit("getUseName", {"userName": res.userName, "type": opt.type });
      const query = opt
      query.menuId = app.redirect
      if (process.env.NODE_ENV === "js") {
        getZZToken();
      }
      if (store.getters['app/appConfig'].nav.zxdc) {
        surveyLogin()
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        resolve();
      }
    })
    .catch(() => {
      if (store.getters["app/appConfig"].nav.zxdc) {
        surveyLogin()
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        resolve();
      }
    });
}

function weappFactory(opt, resolve) {
  if (process.env.NODE_ENV !== "fx") {
    othersFactory(opt, resolve);
  } else {
    if (hasYXTD()) {
      login().then((phone) => {
        initConsole(phone);
        getYJToken(phone);
        if (store.getters["app/appConfig"].nav.zxdc) {
          surveyLogin()
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          resolve();
        }
      });
    } else {
      login().then((phone) => {
        initConsole(phone);
        getYJToken(phone);
        if (process.env.NODE_ENV === "js") {
            getZZToken();
        }
        Vue.prototype.$apiFactory.postMobileToken(phone).then((res) => {
          console.log(res)
          sessionStorage.setItem('userInfo', JSON.stringify(res))
          store.commit('user/SET_USER_ALL', res)
          if (store.getters['app/appConfig'].nav.zxdc) {
            surveyLogin()
              .then(() => resolve())
              .catch(() => resolve());
          } else {
            resolve();
          }
        });
      });
    }
  }
}

export function initFactory(opt) {
  return new Promise((resolve) => {
    switch (opt.type) {
      case "weapp":
        getConfigAndLogin(opt, resolve, weappFactory);
        break;
      default:
        getConfigAndLogin(opt, resolve, othersFactory);
    }
  })
}
