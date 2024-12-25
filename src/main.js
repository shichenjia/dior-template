import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vant from "vant";
import ElementUI from "element-ui"; //引入element-ui库
import VFormRender from "vform-builds/dist/VFormRender.umd.min.js"; //引入VFormRender组件
import "element-ui/lib/theme-chalk/index.css"; //引入element-ui样式
import "vform-builds/dist/VFormRender.css"; //引入VFormRender样式
import * as filters from "./filters/index";
import "vant/lib/index.css";
import plugins from "@/plugin/index";
import axios from "axios";
import "@/permission";
import mitt from "mitt";
/* fix修复H5下录音问题 */
import MPEGMode from "lamejs/src/js/MPEGMode";
import Lame from "lamejs/src/js/Lame";
import BitStream from "lamejs/src/js/BitStream";
window.MPEGMode = MPEGMode;
window.Lame = Lame;
window.BitStream = BitStream;
/* fix修复H5下录音问题 */
// import Vconsole from "vconsole";
// new Vconsole();
Vue.prototype.$axios = axios;
Vue.prototype.$mitt = mitt();
Vue.config.productionTip = false;
Vue.use(ElementUI); //全局注册element-ui
Vue.use(VFormRender); //全局注册VFormRender等组件
Vue.use(vant);
Vue.use(plugins);//将全局函数当做插件来进行注册
Object.keys(filters).forEach(key => {
    // 注册全局过滤器
    Vue.filter(key, filters[key]);
});
new Vue({
    router,
    store,
    "render": (h) => h(App)
}).$mount("#app");