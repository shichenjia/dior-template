import router from "./router";
import store from "./store";
import qs from "qs";
import { init, initFactory } from "@/utils/init";
// 全局判断是否IOS方法
function isIos(){
    const u = navigator.userAgent;

    return u.indexOf("iPhone") > -1 || u.indexOf("Mac OS") > -1;
}
// 获取真实有效微信签名URL
function getWXSignUrl(){
    if(isIos()) {
        return window.location.href;
    }
    return window.location.origin+window.location.pathname+window.location.search;
    // 此处$appHost需要自行处理
    // return $appHost + to.fullPath;

}

/**
 * 创建白名单
 */
export const whiteList = ["/error", "/gisMap", "/login", "/middle"];

router.beforeEach((to, from, next) => {
    let phone = sessionStorage.getItem("phone"),
        projectName = store.getters["app/appConfig"].projectName || "",
        params = to.query;

    // / 路由发生变化修改页面title
    if((to.meta.title??"") !== ""){
        document.title = String(to.meta.title);
    } else{
        if((projectName??"") !== ""){
            document.title = String(projectName);
        }
    }
    if (to.query.biz_param) { // 兼容普陀消息中心跳转过来的
        const otherPrams = qs.parse(decodeURIComponent(to.query.biz_param));

        params = {
            ...otherPrams,
            ...to.query
        };
    }
    if (whiteList.indexOf(to.path) !== -1) {
        next();
    } else if (!phone) {
        init(params, next);
    } else {
        if (to.path === "/auth-redirect") {
            init(params, next, true);
        } else if (to.query.type) {
            initFactory(params).then(() => {
                next();
                store.commit("app/SET_WX_SignUrl", getWXSignUrl());
            });
        } else {
            const query = to.query,
                { type, userid } = from.query;

            if (from.query.isThird) {
                query.isThird = from.query.isThird;
            }
            query.type = type;
            query.userid = userid;
            query.redirect = to.path.replace("/", "");
            initFactory(to.query).then(() => {
                next({
                    "path": to.path,
                    "query": query
                });
            });
        }
    }
});