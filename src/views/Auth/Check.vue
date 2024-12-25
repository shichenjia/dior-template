<template>
    <!-- <van-empty class="bottom-button" description="初始化中" /> -->
    <div class="welcome"></div>
</template>
<script>
import { getPlatFormType, getApiFactory } from "@/utils/platForm.js";
import Vue from "vue";
import { mapMutations } from "vuex";
import qs from "qs";
import { Toast } from "vant";
import dayjs from "dayjs";
import { help } from "@/mixin/mixin";

export default {
    "name": "auth-redirect",
    data() {
        return {
            "style": `height:${window.innerHeight}px;width:${window.innerWidth}px`,
            "appId": "",
            "agentId": "",
            "appSecret": "",
            "userId": "",
            "code": "",
            "weappAppId": "",
            "weappAppSecret": ""
        };
    },
    "mixins": [help],
    "methods": {
        getToken() {
            this.$apiFactory.postLogin(qs.stringify({ "userid": "", "pwd": "" })).then(res => {
                if (res.status === 200) {
                    const tokenInfo = {
                        "token": res.token,
                        "expireTime": dayjs().add(30, "minute")
                    };

                    localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));
                } else {
                    Toast.fail(res.message);
                }
            });
        },
        ...mapMutations(["user/SET_USER_ALL", "caseType/setStatus", "caseType/setMenuId"]),
        initMethodFactory(thirdType) {
            return new Promise((resolve) => {
                Vue.prototype.$methodFactory = new getPlatFormType(thirdType);
                resolve();
            });
        },
        initApiFactory() {
            return new Promise((resolve) => {
                let interfaceType = this.$store.getters["app/appConfig"].interfaceType;

                Vue.prototype.$apiFactory = new getApiFactory(interfaceType);
                resolve();
            });
        },
        redirectError(redirect, message) {
            this.$router.push(
                {
                    "path": redirect,
                    "query": {
                        "message": this.$encrypt(message)
                    }
                },
                () => { }
            );
        },
        getQueryString(name) {
            const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
                result = window.location.search.substring(1).match(reg);

            if (result !== null) {
                return decodeURIComponent(result[2]);
            }
            return null;
        },
        geoInf(param) {
            console.log(param);
        },
        writeLog(log) {
            console.log(log + ":" + dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"));
        },
        surveyLogin() {
            this.$apiFactory.surveyLogin({ "mobile": "" }).then(res => {
                console.log("surveyLogin", res);
                this.$store.state.user.surveyToken = res.access_token;
                this.surveyGetUser();
            });
        }

    }
};
</script>
<style lang="scss" scoped>
.bottom-button {
    height: 100vh;
    background-color: $white;

    ::v-deep .van-empty__description {
        font-size: 20px;
    }
}

.welcome {
    width: 100%;
    height: 100vh;
    float: left;
    background: url("https://zwwx.3h-weixin.com/zwwx-test/static/images/other/welcome.jpg") no-repeat;
    background-size: 100% 100%;
}
</style>
