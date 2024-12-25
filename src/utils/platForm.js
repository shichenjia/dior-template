import { baseFactory } from "@/factory/base.js";
import { h5Factory } from "@/factory/h5.js";
import { wxFactory } from "@/factory/wx.js";
import { ddFactory } from "@/factory/dd.js";
import { baseApiFactory } from "@/apiFactory/base.js";
import { wxMiniFactory } from "@/factory/WXMini.js";
import { appFactory } from "@/factory/app.js";
import { ssbFactory } from "@/factory/ssb.js";
import { androidFactory } from "@/factory/android.js";
import { smyFactory } from "@/factory/smy.js";

export function getPlatFormType(platFormType){
    switch(platFormType.toUpperCase()){
            case "H5":
                return new h5Factory();
            case "WX":
                return new wxFactory();
            case "WEAPP":
                return new wxMiniFactory();
            case "APP":
                return new appFactory();
            case "DD":
                return new ddFactory();
            case "SSB":
                return new ssbFactory();
            case "SMY":
                return new smyFactory();
            case "ANDROID":
                return new androidFactory();
            default:
                return new baseFactory();
    }
}
export function getApiFactory(interfaceType){

    switch(interfaceType.toUpperCase()){
            case "BASE":
                return new baseApiFactory();
            default:
                return new baseApiFactory();
    }
}