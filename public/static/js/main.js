function showSh3hParams() {
    // if (window["sh3hParams"]) {
    //     let account = window["sh3hParams"].account;
    //     let user = window["sh3hParams"].userId;
    //     let userName = window["sh3hParams"].userName;
    //     let accessToken = window["sh3hParams"].accessToken;
    //     alert(`account: ${account}, user: ${user}, userName: ${userName}, accessToken: ${accessToken}`);
    // } else {
    //     alert(`sh3hParams is invalid`);
    // }

    // jsh3h.getCurrentLocation(data => {
    //     console.log(data);
    // });

    //jsh3h.navigateToBarScanner(data => {
    //    console.log(data);
    //});
	//alert("aaa");

	/*jsh3h.takePicture(response => {
		console.log('-----<2>-----');
		console.log(response);
	});*/

	/*jsSdk.uniChooseImage('android', 1, ['camera'])
	  .then(data => {
		  console.log('-----<1>-----');
		  console.log(data);
	  })
	  .catch(error => console.error(error));*/
}

function load() {
    // let timer = setTimeout(() => {
    //     clearTimeout(timer);
    //     showSh3hParams();
    // }, 100);
}

// function handleRNSpecialMessage(event) {
//     try {
//         let params = JSON.parse(event["data"]);
//         if (params && params.type === 'goBack') {
//             //if (this.navCtrl.canGoBack()) {
//             //    this.navCtrl.pop();
//             //} else {
//                 window.hasOwnProperty('ReactNativeWebView')
//                 && window['ReactNativeWebView'].postMessage(JSON.stringify({
//                     type: 'exit'
//                 }));
//            // }
//         }
//     } catch (e) {
//         console.error(e);
//     }
// }

// document.addEventListener("message", handleRNSpecialMessage);

function takePicture() {
	jsh3h.takePicture({'quality': 0.6, pictureWaterOptions: {
                text: '上海三高计算机中心股份有限公司abc',
                textPosition: 'bottomLeft',
                textColor: '#ff0000',
                textSize: 80,
              }}, response => {
		console.log('-----<1>-----');
		console.log(response);

		var img = document.getElementById("img1");
		img.src = `data:image/jpeg;base64,${response.data}`;
		img.width = 300;
		img.height = 200;
	});
}

function choosePicture() {
	jsh3h.chooseImage({quality: 0.6,
              pictureWaterOptions: {
                text: '上海三高计算机中心股份有限公司',
                textPosition: 'bottomLeft',
                textColor: '#ff0000',
                textSize: 80,
              }}, response => {
		console.log('-----<2>-----');
		console.log(response);

		var img = document.getElementById("img2");
		img.src = `data:image/jpeg;base64,${response.data}`;
		img.width = 300;
		img.height = 200;
	});
}

function takeVideo() {
	jsh3h.takeVideo({mediaType: 'video', 'durationLimit': 10}, response => {
		console.log('-----<2>-----');
		console.log(response);
		alert(JSON.stringify(response));
		var video = document.getElementById("video1");
		video.src = response.uri;
	});
}

function getLocation() {
	jsh3h.getCurrentLocation(response => {
		console.log('-----<2>-----');
		console.log(response);
		if (typeof response === 'object') {
			alert(JSON.stringify(response));
		}
	});
}

function getBarCode() {
	jsh3h.getBarCode(response => {
		console.log('-----<2>-----');
		console.log(response);
		if (typeof response === 'object') {
			alert(JSON.stringify(response));
		}
	});
}

function getQRCode() {
	jsh3h.getQRCode(response => {
		console.log('-----<2>-----');
		console.log(response);
		if (typeof response === 'object') {
			alert(JSON.stringify(response));
		}
	});
}

function getDeviceInfo() {
	jsh3h.getDeviceInfo(response => {
		console.log('-----<2>-----');
		console.log(response);
		if (typeof response === 'object') {
			alert(JSON.stringify(response));
		}
	});
}

function getDeviceToken() {
	jsh3h.getDeviceToken(response => {
		console.log('-----<2>-----');
		console.log(response);
		if (typeof response === 'object') {
			alert(JSON.stringify(response));
		}
	});
}

function exit() {
	jsh3h.exit();
}

function downloadFile() {
	uni.downloadFile({
	url: 'http://128.1.3.60:18075/page2.rar', //仅为示例，并非真实的资源
	success: (res) => {
		if (res.statusCode === 200) {
			console.log('下载成功');
		}
		alert(JSON.stringify(res));
		/*console.log(res);
		var tempFilePath = res.tempFilePath;
    uni.saveFile({
      tempFilePath: tempFilePath,
      success: function (res) {
        var savedFilePath = res.savedFilePath;
		alert(savedFilePath);
      }
    });*/
	}
});
}

function startRecordAudio() {
	jsh3h.startRecordAudio(response => {
		console.log('-----startRecordAudio-----');
		console.log(response);
	});
}

let audioFileName;
function stopRecordAudio() {
	jsh3h.stopRecordAudio(response => {
		console.log('-----stopRecordAudio-----');
		console.log(response);
		if (response && response.fileName) {
			audioFileName = response.fileName;
		}
	});
}

function startPlayAudio() {
	jsh3h.startPlayAudio({uri: audioFileName}, response => {
		console.log('-----startPlayAudio-----');
		console.log(response);
	});
}

function stopPlayAudio() {
	jsh3h.stopPlayAudio(response => {
		console.log('-----stopPlayAudio-----');
		console.log(response);
	});
}

function gotoProfile() {
	jsh3h.gotoProfile(response => {
		console.log('-----gotoProfile-----');
		console.log(response);
	});
}

jsh3h.init();
jsh3h.getPushMessage(data => {
	if (typeof data === 'object') {
		alert(JSON.stringify(data));
	} else {
		alert(data);
	}
});
