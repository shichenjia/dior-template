import axios from "axios";
//加载系统信息
export async function loadAppConfig(mode) {
    const service = axios.create({
        "baseURL": process.env.BASE_URL // api 的 base_url
    });

    if (mode) {
        return service({
            "url": "/static/json/" + mode + "/appConfig.json?" + new Date().getTime(),
            "method": "get"
        });
    }
    return service({
        "url": "/static/json/" +
            process.env.VUE_APP_BASE_DISTRICT +
            "/appConfig.json?" +
            new Date().getTime(),
        "method": "get"
    });
}