
/**
 * 多屏同步
 * @alias FdMultiViewSync
 * @class
 *
 * @example
 * var container = document.getElementById("freedoContainer");
 * var project = Freedo.FdApp.createProject(container);
 * var remoteCollaboration = project.getRemoteCollaboration();
 * var container1 = document.getElementById("freedoContainer1");
 * var container2 = document.getElementById("freedoContainer2");
 * var container3 = document.getElementById("freedoContainer3");
 * var container4 = document.getElementById("freedoContainer4");
 *
 * var project1 = Freedo.FdApp.createProject(container1);
 * var project2 = Freedo.FdApp.createProject(container2);
 * var project3 = Freedo.FdApp.createProject(container3);
 * var project4 = Freedo.FdApp.createProject(container4);
 *
 * var gView = {
 * 	   v: "",
 * 	   t: 0,
 * 	   o: ""
 * };
 * var v1 = new FdMultiViewSync(gView, project1, "1");
 * var v2 = new FdMultiViewSync(gView, project2, "2");
 * var v3 = new FdMultiViewSync(gView, project3, "3");
 * var v4 = new FdMultiViewSync(gView, project4, "4");
 *
 * v1.run();
 * v2.run();
 * v3.run();
 * v4.run();
 */
function FdMultiViewSync(gView, viewer, title) {
    this._title = title;
    this._viewer = viewer;
    // this._viewer = project.getViewer();
    // this._project = project;
    this._gView = gView;

    this._bInRun = false;
    this._bUnLink = false;

    this._lastVT = 1;
    this._lastV = "";
}

//绑定事件函数
FdMultiViewSync.prototype.on = function (eventName, callback) {
    this._event[eventName] = this._event[eventName] || [];
    this._event[eventName].push(callback);
};

/**
 * 开始同步
 */
FdMultiViewSync.prototype.run = function () {
    if (this._bInRun)
        return;
    else
        this._bInRun = true;
    this.addLsnr();
}

FdMultiViewSync.prototype.onPostRender = function () {
    var v = this.getV();
    if (v != this._lastV) {
        this._lastV = v;
        this._lastVT = (new Date()).getTime();
        //console.log(this._title + " 需要更新自己的视图");
    }

    if (!this._bUnLink) {
        this.syncView();
    }
}

/**
 * 获取当前相机的姿态
 * @private
 * @returns 返回姿态信息
 */
FdMultiViewSync.prototype.getV = function () {
    var cartographic = this._viewer.camera.positionCartographic;
    var heading = this._viewer.camera.heading;
    var pitch = this._viewer.camera.pitch;
    var roll = this._viewer.camera.roll;
    var v = '' + Freedo.FdMisc.FdMath.round(Freedo.Math.toDegrees(cartographic.longitude), 8) +
        ', ' + Freedo.FdMisc.FdMath.round(Freedo.Math.toDegrees(cartographic.latitude), 8) +
        ', ' + Freedo.FdMisc.FdMath.round(cartographic.height, 4) +
        ', ' + Freedo.FdMisc.FdMath.round(Freedo.Math.toDegrees(heading), 4) +
        ', ' + Freedo.FdMisc.FdMath.round(Freedo.Math.toDegrees(pitch), 4) +
        ', ' + Freedo.FdMisc.FdMath.round(Freedo.Math.toDegrees(roll), 4);
    return v;
}

/**
 * 同步视图
 * @private
 */
FdMultiViewSync.prototype.syncView = function () {
    if (this._bUnLink)
        return;

    var v = this.getV();

    if (this._gView.v != v) {
        if (this._gView.t > this._lastVT) {
            if (this._gView.o != this._title) {
                var aPos = this._gView.v.split(",");
                this.setView(aPos[0], aPos[1], aPos[2], aPos[3], aPos[4], aPos[5]);
                this._lastV = this._gView.v;
                this._lastVT = this._gView.t - 10;
                //console.log(this._title + " 从全局视图中更新自己");
            }
        } else {
            this._gView.t = this._lastVT;
            this._gView.v = v;
            this._gView.o = this._title;
            //console.log(this._title + " 是新的 更新 全局视图");
        }
    }
    this._viewer.scene.requestRender();
}

/**
 * 设置当前相机的姿态
 * @private
 */
FdMultiViewSync.prototype.setView = function (lon, lat, height, heading, pitch, roll) {
    this._viewer.camera.setView({
        destination: Freedo.Cartesian3.fromDegrees(lon, lat, height),
        orientation: {
            heading: Freedo.Math.toRadians(heading),
            pitch: Freedo.Math.toRadians(pitch),
            roll: Freedo.Math.toRadians(roll)
        }
    });
}

/**
 * 设置当前相机的姿态
 * @prama {Boolean} enable 设置连接状态是否生效
 */
FdMultiViewSync.prototype.enableLink = function (enable) {
    this._bUnLink = enable;
}

FdMultiViewSync.prototype.addLsnr = function () {
    this._viewer.scene._postRender.addEventListener(this.onPostRender.bind(this), null);
}

FdMultiViewSync.prototype.dispose = function () {}

FdMultiViewSync.prototype.reset = function () {}
