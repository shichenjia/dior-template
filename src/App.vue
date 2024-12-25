<template>
  <div id="app" :style="style">
    <router-view />
    <div id="tohome" ref="tohome" @click="toHome()" v-show="!isHome"></div>
    <div
      id="tohome"
      @click="cmBack"
      :class="{ cmBack: currentEnv }"
      v-show="currentEnv && isHome"
    ></div>
    <van-action-sheet
      v-model="show"
      :actions="actions"
      @select="onSelect"
      description="请选择登录【浦东网格化管理】的授权账号"
      close-on-click-action
      :close-on-click-overlay="false"
    />
  </div>
</template>
<script>
import dayjs from "dayjs";
import watermark from "@/utils/waterMark";
import { whiteList } from "./permission";
import { hasYXTD } from "@/utils/init";

export default {
    data() {
        return {
            "flag": 0,
            "isHome": false,
            "show": false,
            "actions": [],
            "callBack": null
        };
    },
    "computed": {
        currentEnv() {
            return process.env.NODE_ENV === "cm";
        },
        style() {
            return "width:100vw;height:100vh;box-sizing: border-box;overflow:hidden";
        },
        isAndriod() {
            const userAgent = navigator.userAgent;

            return userAgent.indexOf("Android") > -1 || userAgent.indexOf("Adr") > -1; //android终端
        },
        isThird({ $route }) {
            return Boolean($route.query.isThird);
        }
    },
    created() {
        this.$mitt.on("showChangeAccountSheet", ({ actions, callBack }) => {
            this.actions = actions;
            this.callBack = callBack;
            this.show = true;
        });
        this.$mitt.on("getUseName", this.waterMarkInit);
    },
    mounted() {
        if (!this.isAndriod) {
            let flag = false,
                pageBackNormFunc;
            // 聚焦后，键盘弹起

            document.body.addEventListener("focusin", () => {
                flag = true;
                if (pageBackNormFunc) {
                    clearTimeout(pageBackNormFunc);
                }
            });
            // 失焦后，键盘关闭
            document.body.addEventListener("focusout", () => {
                if (flag) {
                    // 页面滚动回原来的位置
                    pageBackNormFunc = setTimeout(() => {
                        window.scrollTo({ "top": 0, "left": 0, "behavior": "smooth" });
                    }, 200);
                }
                flag = false;
            });

            // let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
            // window.scrollTo(0, Math.max(scrollHeight - 1, 0));
        }
    },
    "methods": {
        waterMarkInit({ userName, type }) {
            if (
                process.env.VUE_APP_BASE_DISTRICT === "pd" &&
        (type === "weapp" || type === "smy")
            ) {
                const today = dayjs().format("YYYY/MM/DD"),
                    phone = sessionStorage.getItem("phone").substring(7, 11);

                watermark.set(today , phone , userName);
            }
        },
        cmBack() {
            window.location.href = "https://cm-cmt.shdata.com:8000/ilogcm";
        },
        onSelect({ value }) {
            this.callBack.call(null, value);
        },
        setHomeStyle(style = "none") {
            const home = document.getElementById("tohome");

            home.style.display = style;
        },
        toHome() {
            if (this.flag === 1 && this.$refs.tohome.style.right === "0px") {
                this.$router.push({ "path": "/home", "query": { "menuId": "home" } });
                setTimeout(() => {
                    this.$refs.tohome.style.right = "-30px";
                    this.flag = 0;
                }, 500);
            } else {
                this.$refs.tohome.style.right = 0;
                this.flag = 1;
                setTimeout(() => {
                    this.$refs.tohome.style.right = "-30px";
                }, 2000);
            }
        }
    },
    "watch": {
        "$route": {
            "deep": true,
            "handler": function () {
                if (this.$route.name === "home") {
                    this.isHome = true;
                } else {
                    this.isHome = false;
                }
                if (
          this.$route.name?.indexOf("third") > -1 ||
          whiteList.indexOf(this.$route.path) > 0
                ) {
                    this.setHomeStyle();
                }

                if (hasYXTD()) {
                    // 如果只有一线通达的权限
                    this.setHomeStyle();
                }
            }
        },
        isThird(status) {
            this.setHomeStyle(status ? "none" : "block");
        }
    }
};
</script>
<style lang="scss">
#app {
  background-color: $bg-color;
  height: 100vh;

  #tohome {
    width: 320px;
    height: 320px;
    background: url("https://zwwx.3h-weixin.com/zwwx-test/static/assets/home/home.png") no-repeat;
    background-size: 100% 100%;
    position: fixed;
    right: -150px;
    bottom: 330px;
    border-radius: 50%;
    z-index: 999;
    transition: 0.5s;

    &.cmBack {
      right: 0;
      background-image: url("https://zwwx.3h-weixin.com/zwwx-test/static/assets/home/back.png");
    }
  }

  &.overAuto {
    overflow-y: scroll !important;
  }
}
</style>
