var cameraHistoryUI = new Vue({
    el: "#camera-history-app",
    data: {
        pathLength: 0,
        currentIndex: 0,
        notUse:true
    }
});
var cameraHistory;
Sandcastle.addToggleButton("开启相机历史", false, function(flag){

	if(flag){
		cameraHistoryUI.notUse = false;
		cameraHistory = new Freedo.FdCamera.FdCameraHistory(viewer.camera);
		cameraHistory.on(function (eventType) {
		    if (eventType === 'CameraPathChanged') {
		        cameraHistoryUI.pathLength = cameraHistory.pathLength;
		        cameraHistoryUI.currentIndex = cameraHistory.currentIndex+1;
		    }
		});
        Sandcastle.addToolbarButton('相机回撤', function () {
            cameraHistory.prev();
        },"toolbar_camera_menu");

        Sandcastle.addToolbarButton('相机恢复', function () {
            cameraHistory.next();
        },"toolbar_camera_menu");
	}else{
		if(Freedo.defined(cameraHistory)){
			cameraHistory.dispose();
			cameraHistory = null;
			cameraHistoryUI.notUse = true;
			cameraHistoryUI.pathLength = 0;
			cameraHistoryUI.currentIndex = 0;
			var elem = document.getElementById("toolbar_camera_menu");
            while(elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
            {
                elem.removeChild(elem.firstChild);
            }
		}
		
	}
}, "toolbar");
