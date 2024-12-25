'use strict';

var jsh3h = (function f() {
    let funArray = [];
    let EVENT_TYPE = 'message';
    let CURRENT_LOCATION_TYPE = 'CurrentLocation';
    let BAR_CODE_TYPE = 'GetBarCode';
    let QR_CODE_TYPE = 'GetQRCode';
    let CHOOSE_IMAGE_TYPE = 'ChooseImage';
    let CHOOSE_IMAGES_TYPE = 'ChooseImages';
    let TAKE_PICTURE_TYPE = 'TakePicture';
    let TAKE_VIDEO_TYPE = 'TakeVideo';
    let PUSH_MESSAGE_TYPE = 'PushMessage';
    let DEVICE_INFO_TYPE = 'deviceInfo';
    let DEVICE_TOKEN_TYPE = 'deviceToken';
    let START_RECORD_AUDIO_TYPE = 'startRecordAudio';
    let STOP_RECORD_AUDIO_TYPE = 'stopRecordAudio';
    let START_PLAY_AUDIO_TYPE = 'startPlayAudio';
    let STOP_PLAY_AUDIO_TYPE = 'stopPlayAudio';
    let GOTO_PROFILE_TYPE = 'gotoProfile';
    let UPLOAD_FILES = 'uploadFiles';
    let GET_FILE_BLOB = 'getFileBlob';


    /**
     * 回调函数
     * @param event
     * @private
     */
    function _callback(event) {
        try {
            let params = JSON.parse(event["data"]);
            if (params && typeof params.messageType === 'string') {
                let index = funArray.findIndex(item => item.type === params.messageType);
				if (index >= 0 && index < funArray.length) {
					if (params.messageType === PUSH_MESSAGE_TYPE) {
						funArray[index].callback && funArray[index].callback(params);
						return;
					}
					let results = funArray.splice(index, 1);
					if (results.length === 1) {
						results[0].callback && results[0].callback(params);
					}
				}
                /*if (results.length > 0) {
                    results.forEach(item => item.callback && item.callback(params));
                    funArray = funArray.filter(item => item.type !== 'CurrentLocation');
                }*/
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * 添加事件监听
     * @param callback
     * @private
     */
    function _addMessageListener(callback) {
        callback && document.addEventListener(EVENT_TYPE, callback);
        //callback && window.addEventListener(EVENT_TYPE, callback);
    }

    /**
     * 移除事件监听
     * @param callback
     * @private
     */
    function _removeMessageListener(callback) {
        callback && document.removeEventListener(EVENT_TYPE, callback);
        //callback && window.removeEventListener(EVENT_TYPE, callback);
    }

    /**
     * 向rn发送消息
     * 格式: JSON.stringify({type: 'string', data: object})
     * @param message json字符串
     */
    function _postMessage(message) {
        if (typeof message === 'string') {
            window.hasOwnProperty('ReactNativeWebView') && window['ReactNativeWebView'].postMessage(message);
        } else {
            console.error('message is not a string');
        }
    }

    /**
     * 初始化
     */
    function init() {
        _addMessageListener(_callback);
    }

    /**
     * 销毁
     */
    function destroy() {
        _removeMessageListener(_callback);
    }

    /**
     * 获取坐标
     * @param callback
     */
    function getCurrentLocation(callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: CURRENT_LOCATION_TYPE,
            callback
        });
        _postMessage(JSON.stringify({type: CURRENT_LOCATION_TYPE}));
    }

    /**
     * 跳转到条形码扫描
     * @param callback
     */
    function getBarCode(callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: BAR_CODE_TYPE,
            callback
        });
        _postMessage(JSON.stringify({type: BAR_CODE_TYPE}));
    }

    /**
     * 退出系统
     */
    function exit() {
        _postMessage(JSON.stringify({type: 'exit'}));
    }

    /**
     * 从手机相册中选图接口
     * @param callback
     */
    function chooseImage(options, callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: CHOOSE_IMAGE_TYPE,
            callback
        });

        _postMessage(JSON.stringify({type: CHOOSE_IMAGE_TYPE, options}));
    }

    /**
     * 从手机相册选择多张图片接口
     * @param callback
     */
    function chooseImages(options, callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: CHOOSE_IMAGES_TYPE,
            callback
        });

        _postMessage(JSON.stringify({type: CHOOSE_IMAGES_TYPE, options}));
    }

    /**
     * 拍照
     * @param callback
     */
    function takePicture(options, callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: TAKE_PICTURE_TYPE,
            callback
        });

        _postMessage(JSON.stringify({type: TAKE_PICTURE_TYPE, options}));
    }

    /**
     * 拍照或从手机相册中选图接口
     * @param callback
     */
    function takeVideo(options, callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: TAKE_VIDEO_TYPE,
            callback
        });

        _postMessage(JSON.stringify({type: TAKE_VIDEO_TYPE, options}));
    }

	/**
     * 获取推送消息
     * @param callback
     */
	function getPushMessage(callback) {
		let id = new Date().getTime();
        funArray.push({
            id,
            type: PUSH_MESSAGE_TYPE,
            callback
        });

        //_postMessage(JSON.stringify({type: PUSH_MESSAGE_TYPE, options}));
	}

	/**
     * 获取设备信息
     * @param callback
     */
	function getDeviceInfo(callback) {
		let id = new Date().getTime();
        funArray.push({
            id,
            type: DEVICE_INFO_TYPE,
            callback
        });

        _postMessage(JSON.stringify({type: DEVICE_INFO_TYPE}));
	}

	/**
     * 获取设备token
     * @param callback
     */
	function getDeviceToken(callback) {
		let id = new Date().getTime();
        funArray.push({
            id,
            type: DEVICE_TOKEN_TYPE,
            callback
        });

        _postMessage(JSON.stringify({type: DEVICE_TOKEN_TYPE}));
	}

	/**
     * 扫描二维码
     * @param callback
     */
    function getQRCode(callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: QR_CODE_TYPE,
            callback
        });
        _postMessage(JSON.stringify({type: QR_CODE_TYPE}));
    }

    function startRecordAudio(callback) {
      let id = new Date().getTime();
      funArray.push({
        id,
        type: START_RECORD_AUDIO_TYPE,
        callback
      });
      _postMessage(JSON.stringify({type: START_RECORD_AUDIO_TYPE}));
    }

    function stopRecordAudio(callback) {
      let id = new Date().getTime();
      funArray.push({
        id,
        type: STOP_RECORD_AUDIO_TYPE,
        callback
      });
      _postMessage(JSON.stringify({type: STOP_RECORD_AUDIO_TYPE}));
    }

    function startPlayAudio(options, callback) {
      let id = new Date().getTime();
      funArray.push({
        id,
        type: START_PLAY_AUDIO_TYPE,
        callback
      });

      _postMessage(JSON.stringify({type: START_PLAY_AUDIO_TYPE, options}));
    }

    function stopPlayAudio(callback) {
      let id = new Date().getTime();
      funArray.push({
        id,
        type: STOP_PLAY_AUDIO_TYPE,
        callback
      });

      _postMessage(JSON.stringify({type: STOP_PLAY_AUDIO_TYPE}));
    }

    function gotoProfile(callback) {
      let id = new Date().getTime();
      funArray.push({
        id,
        type: GOTO_PROFILE_TYPE,
        callback
      });

      _postMessage(JSON.stringify({type: GOTO_PROFILE_TYPE}));
    }

    function uploadFiles(options, callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: UPLOAD_FILES,
            callback
        });

        _postMessage(JSON.stringify({type: UPLOAD_FILES, options}));
    }

    function getFileBlob(options, callback) {
        let id = new Date().getTime();
        funArray.push({
            id,
            type: GET_FILE_BLOB,
            callback
        });

        _postMessage(JSON.stringify({type: GET_FILE_BLOB, options}));
    }

    window.setSh3hParams = function (params) {
        window.sh3hParams = params;
    };

    return {
        init,
        destroy,
        getCurrentLocation,
        getBarCode,
        exit,
        chooseImage,
        chooseImages,
        takePicture,
        takeVideo,
        getPushMessage,
        getDeviceInfo,
        getDeviceToken,
        getQRCode,
        startRecordAudio,
        stopRecordAudio,
        startPlayAudio,
        stopPlayAudio,
        gotoProfile,
        uploadFiles,
        getFileBlob,
    };
})();
