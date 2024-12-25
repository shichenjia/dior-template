/**
 * Created by Administrator on 2017/12/25.
 */
function postToIframeMethed(methedName, data, backFun) {
    //            if(typeof(exec_obj)=='undefined'){
    //                exec_obj = document.createElement('iframe');
    //                exec_obj.name = 'tmp_frame';
    //                exec_obj.src = 'http://139.196.105.31/HKGisShare/ZoomIn.html';
    //                exec_obj.style.display = 'none';
    //                document.body.appendChild(exec_obj);
    //            }else{
    //                exec_obj.src = 'http://139.196.105.31/HKGisShare/ZoomIn.html?' + Math.random();
    //            }
    var win = document.getElementsByTagName("iframe")[0].contentWindow;
    //  var obj = { name: 'Jack' };
    // 存入对象

    win.postMessage(
        JSON.stringify({
            "method": methedName,
            "data": data,
            "backfun": backFun
        }),
        "*"
    );
    // 读取对象
    // win.postMessage(JSON.stringify({key: 'storage', method: "get"}), "*");
    window.onmessage = function (e) {
        if (e.origin != "http://localhost") {
            return;
        }
        // "Jack"
        console.log(JSON.parse(e.data).name);
    };
}

function ZoomIn(level) {
    postToIframeMethed("ZoomIn", level);
}

function ZoomOut(level) {
    postToIframeMethed("ZoomOut", level);
}

function Clear(type) {
    //var type = "drawLayer" // all  drawLayer   queryLayer
    postToIframeMethed("Clear", type);
}

function ViewChange() {
    postToIframeMethed("ViewChange");
}

function fullExtent() {
    postToIframeMethed("fullExtent");
}

function doSetExtent(num) {
    postToIframeMethed("doSetExtent", num);
}

function measureSquare() {
    postToIframeMethed("measureSquare");
}

function measureLength() {
    postToIframeMethed("measureLength");
}

function downLoadPicture() {
    postToIframeMethed("downLoadPicture");
}

function doGetGraphicByJson(jsonStr, isGoTo) {
    postToIframeMethed("doGetGraphicByJson", [jsonStr, isGoTo]);
}

function drawSquare() {
    postToIframeMethed("drawSquare");
}

function query(Str, layerName) {
    postToIframeMethed("query", [Str, layerName]);
}

function queryByWhereStr(Str, layerName) {
    postToIframeMethed("queryByWhereStr", [Str, layerName]);
}

function doOpenFeatureLayer(layerId, layerVisible) {
    postToIframeMethed("openFeatureLayer", [layerId, layerVisible]);
}

function doOpenFeatureLayerByName(layerName, layerVisible) {
    postToIframeMethed("openFeatureLayerByName", [layerName, layerVisible]);
}

function doOpenFeatureLayer0(layerVisible) {
    postToIframeMethed("openFeatureLayer0", [layerVisible]);
}

function doOpenFeatureLayer1(layerVisible) {
    postToIframeMethed("openFeatureLayer1", [layerVisible]);
}

function doOpenFeatureLayer2(layerVisible) {
    postToIframeMethed("openFeatureLayer2", [layerVisible]);
}

function doOpenFeatureLayer3(layerVisible) {
    postToIframeMethed("openFeatureLayer3", [layerVisible]);
}

function doOpenFeatureLayer4(layerVisible) {
    postToIframeMethed("openFeatureLayer4", [layerVisible]);
}

function doOpenFeatureLayer5(layerVisible) {
    postToIframeMethed("openFeatureLayer5", [layerVisible]);
}

function doOpenFeatureLayer6(layerVisible) {
    postToIframeMethed("openFeatureLayer6", [layerVisible]);
}

function doOpenFeatureLayer7(layerVisible) {
    postToIframeMethed("openFeatureLayer7", [layerVisible]);
}

function doOpenFeatureLayer8(layerVisible) {
    postToIframeMethed("openFeatureLayer8", [layerVisible]);
}

function doOpenFeatureLayer9(layerVisible) {
    postToIframeMethed("openFeatureLayer9", [layerVisible]);
}

function doOpenFeatureLayer10(layerVisible) {
    postToIframeMethed("openFeatureLayer10", [layerVisible]);
}

function doFlashStatus(layerName) {
    postToIframeMethed("doFlashStatus", [layerName]);
}

function setCenterExtentByPointR(x, y, radius) {
    postToIframeMethed("setCenterExtent", [x, y, radius]);
}

function doDrawCircle(color) {
    postToIframeMethed("drawCircle", [color]);
}

function doQueryByCircle(layerName, picUrl, width, height) {
    postToIframeMethed("queryByCircle", [layerName, picUrl, width, height]);
}

//  2019 12 by hm
function doOnLocation(x, y, Attribute, ToolTip, ImgUrl, ImgWidth, ImgHeight) {
    postToIframeMethed("onLocation", [
        x,
        y,
        Attribute,
        ToolTip,
        ImgUrl,
        ImgWidth,
        ImgHeight
    ]);
}

function doMeasureLengthByPoint(x, y, x1, y1, backFun) {
    postToIframeMethed("MeasureLengthByPoint", [x, y, x1, y1], backFun);
}

function doNewQuery(str, layerName, isgoto) {
    postToIframeMethed("newQuery", [str, layerName, isgoto]);
}

function doGridQuery(str, isgoto) {
    doNewQuery(str, "责任网格", isgoto);
}

function doOnLocationforGrid(x, y) {
    postToIframeMethed("onLocationforGrid", [x, y]);
}

function doOnLocationforAddress(x, y) {
    postToIframeMethed("onLocationforAddress", [x, y]);
}

function doOnMapSetCenterByXY(x, y) {
    postToIframeMethed("doOnMapSetCenterByXY", [x, y]);
}

function doOnQueryByPoint(x, y, layername, radius, isshow, isGoTo) {
    postToIframeMethed("onQueryByPoint", [
        x,
        y,
        layername,
        radius,
        isshow,
        isGoTo
    ]);
}

function doOnQueryByGrid(grid, layername) {
    postToIframeMethed("onQueryByGrid", [grid, layername]);
}

function doOnMapCenter() {
    postToIframeMethed("onMapCenter");
}

function doOnMapLevel() {
    postToIframeMethed("onMapLevel");
}

function doOnMapSetCenter(x, y) {
    postToIframeMethed("onMapSetCenter", [x, y]);
}

function doOnGetXYbyAddress(str) {
    postToIframeMethed("onGetXYbyAddress", [str]);
}

function doOnSetInitExtentByStr(layername, streetname) {
    postToIframeMethed("onSetInitExtentByStr", [layername, streetname]);
}

function doOnQueryByCondition(str, layername, isShow, isGoTo) {
    postToIframeMethed("onQueryByCondition", [str, layername, isShow, isGoTo]);
}

function doOpenFeatureLayerByNameandWhere(
    layername,
    type,
    name,
    isGoTo,
    isOpen
) {
    postToIframeMethed("openFeatureLayerByNameandWhere", [
        layername,
        type,
        name,
        isGoTo,
        isOpen
    ]);
}
//2020 2 by hm
function doOnClickLocation(Attribute, ToolTip, ImgUrl, ImgWidth, ImgHeight) {
    postToIframeMethed("onClickLocation", [
        Attribute,
        ToolTip,
        ImgUrl,
        ImgWidth,
        ImgHeight
    ]);
}
////////////////////////////////////////////////////////////////////////
window.addEventListener(
    "message",
    function (e) {
        var data = e.data;

        switch (data.method) {
                case "measureLengthCallback": {
                    measureLengthCallback(data.data[0]);
                    break;
                }
                case "identifyTaskcallbackfun": {
                    identifyTaskcallbackfun(data.data[0]);
                    break;
                }
                case "maploadCallback": {
                    maploadCallback();
                    break;
                }
                case "addressdataCallback": {
                    addressdataCallback(data.data[0]);
                    break;
                }
                case "dragendCallback": {
                    dragendCallback();
                    break;
                }
                case "queryByGeometryAndLayer": {
                    queryByGeometryAndLayer(data.data[0]);
                    break;
                }
                case "mapCenterCallback": {
                    mapCenterCallback(data.data[0]);
                    break;
                }
                case "mapOnclickCallback": {
                    mapOnclickCallback(data.data[0], data.data[1]);
                    break;
                }
                case "mapLevelCallback": {
                    mapLevelCallback(data.data[0]);
                    break;
                }
                case "resizeCallback": {
                    resizeCallback();
                    break;
                }
                case "XYbyAddressCallback": {
                    XYbyAddressCallback(data.data[0]);
                    break;
                }
                case "mapAnimationInProgressCallback": {
                    mapAnimationInProgressCallback();
                    break;
                }
                case "mapDragingCallback": {
                    mapDragingCallback();
                    break;
                }
                case "clicklocationcallbackfun": {
                    clicklocationcallback(data.data[0], data.data[1]);
                    break;
                }
        }
    },
    false
);

function measureLengthCallback(len) {
    console.log(len);
}

function identifyTaskcallbackfun(results) {
    console.log("网格编码=" + results);
}

function maploadCallback() {
    console.log("maploaded");
    // doNewQuery("1=1","上水井盖");
    // doNewQuery("1=1","污水井盖");
    // doNewQuery("1=1","雨水篦子");
    // doOnSetInitExtentByStr("区县边界","浦东新区");
    // doOnSetInitExtentByStr("街道乡镇","枫林街道");
    // doOnSetInitExtentByStr("街道乡镇","万祥镇");
    // var Attribute = '{ "ID": "1","名称": "测试点1" }';
    // var ToolTip = '测试点1';
    // var ImgUrl = 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png';
    // var ImgWidth = '32px';
    // var ImgHeight = '32px';
    // postToIframeMethed("onLocation",[121.1,31.1,Attribute,ToolTip,ImgUrl,ImgWidth,ImgHeight]);
}

function addressdataCallback(address) {
    console.log(address);
}

function dragendCallback() {
    console.log("dragend");
}

function queryByGeometryAndLayer(data) {
    // alert(data);
}

function mapCenterCallback(data) {
    // alert(data);
}

function mapOnclickCallback(data, gridid) {
    alert(data + "网格编码=" + gridid);
}

function mapLevelCallback(data) {
    alert(data);
}

function resizeCallback() {
    console.log("mapresize");
}

function XYbyAddressCallback(data) {
    // alert(data);
    console.log(data);
}

function mapAnimationInProgressCallback() {
    console.log("mapAnimationInProgressCallback");
}

function mapDragingCallback() {
    console.log("mapDragingCallback");
}

function clicklocationcallback(data, lonlat) {
    console.log(data);
    console.log(lonlat);
}