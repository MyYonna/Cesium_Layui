var pmtsUrl = '';
let baseURL = '//' + window.location.host;
let token = undefined;
var pModelInfos = [];
var queryURL_1 = getPublicSharedPmtsURL('d9d39409-c3d0-4843-b042-70c6b552e5c9', '295e3e7b-2edb-4eac-9361-35cb8cb01f66');
var modelMatrix_1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -5, 5, 0, 1];

function getPublicSharedPmtsURL(id, accessKey) {
    return '//cfgateway.gbim360.cn/freeserver-pmts/services/share/' + id +
        '/pmts/1.0.0/PMTSCapabilities.json?accesskey=' + accessKey;
}

Freedo.FdServer.FdShareServer.getLayerAccesskeyResource(queryURL_1, 'json', function(jsonPMTSCapabilities,
    error) {
    if (error) {
        console.error('FdServer.FdShareServer.getLayerAccesskeyResource got error: ' + error);
        return;
    }
    printJsonPMTSCapabilitiesInfo(jsonPMTSCapabilities, modelMatrix_1);
});
//加载倾斜摄影
function printJsonPMTSCapabilitiesInfo(jsonPMTSCapabilities, offsetModelMatrix) {
    jsonPMTSCapabilities.contents.layers.forEach(function(layer) {
        let matrixSets = Freedo.FdServer.FdPMTSParser.getMatrixSets(jsonPMTSCapabilities, layer);
        matrixSets.forEach(function(matrixSet) {
            matrixSet.matrix.forEach(function(matrix) {
                let pModelURL = Freedo.FdServer.FdPMTSParser.getPModelURL(layer,
                    matrixSet, matrix, token);
                var pmodelSet = new Freedo.FreedoPModelset({
                    url: pModelURL
                });
                
                var pModel = viewer.scene.primitives.add(pmodelSet);
                pModel.modelMatrix = Freedo.Matrix4.fromArray(offsetModelMatrix);

                pModelInfos.push({
                    pModel: pModel,
                    matrix: matrix,
                    matrixSet: matrixSet,
                    layer: layer
                });
                pModel.readyPromise.then(function(pModel) {
                    viewer.camera.viewBoundingSphere(pModel.boundingSphere,
                        new Freedo.HeadingPitchRange(
                            0, -90, 0));
                    viewer.camera.lookAtTransform(Freedo.Matrix4.IDENTITY);
                });
            })
        })
    })
}

//点击获取部件
function pickComponent(windowPosition, retAncestorComponents, selectedCallback) {
    var picked = viewer.scene.pick(windowPosition);
    if (Freedo.defined(picked)) {
        openParkInfoWindow()
        // var componentID = picked.getProperty("component");
        // if (Freedo.defined(componentID)) {
        //     var ancestorComponents = undefined;
        //     if (retAncestorComponents) {
        //     	//获取祖先部件
        //         ancestorComponents = picked.getAncestors('component');
        //     }
        //     selectedCallback(picked._content._tileset, componentID, ancestorComponents);
        //     return;
        // }
        
    }
}
function openParkInfoWindow(){
            var panel = Ext.create('Ext.panel.Panel', {
                title: 'Hello',
                width: 200,
                html: document.getElementById("parkinfo"),
                renderTo: Ext.getBody()
            });

       //    var win = new Ext.Window({
       //      title:'千园',
       //      layout:'fit',       //弹出窗口内布局会充满整个窗口;
       //      width:300,          //设置窗口大小;
       //      height:500,
       //      closeAction:'hide', //点击右上角关闭按钮后会执行的操作;
       //      closable:true,     //隐藏关闭按钮;
       //      minimizable:true,
       //      draggable:true,     //窗口可拖动;
       //      items:[panel],         //默认会生成Ext.Panel类型的对象;并且随窗口大小改变而改变;
       //      buttons:[],
       //      x: 170,
       //      y: 10,
       //      listeners : { 
       //          close : function(window) { 
       //              // var delObj = document.getElementById(window.button.id); 
       //              // delObj.parentNode.parentNode.removeChild(delObj.parentNode); 
       //          } 
       //      }
       //    });
       // win.show();
}
let handler = new Freedo.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function(movement) {
    viewer.camera.cancelFlight();
    let pos = movement.position;
    pickComponent(pos, false, function(pModel, componentID, ancestorComponents) {
        if (typeof pModel !== 'undefined' && typeof componentID !== 'undefined') {
        	//点击得到的部件是否为之前加载的部件
            let pModelInfo = pModelInfos.find(function(element) {
                return element.pModel === pModel;
            });
            //获取部件的属性信息
            Freedo.FdServer.FdPMTSParser.getPropJson(pModelInfo.layer, pModelInfo.matrixSet,
                componentID,
                token,
                function(json, error) {
                    if (typeof error === 'undefined') {
                        console.log("部件的属性信息",json);
                        //propListUI.propJson = json;
                    } else {
                        console.log('error: ' + error);
                    }
                }
            );
            if(Freedo.defined(ancestorComponents)){
	            // 获取之前pick到的部件的祖先部件的节点信息
	            ancestorComponents.forEach(function(uid) {
	                Freedo.FdServer.FdPMTSParser.getUidJson(pModelInfo.layer, pModelInfo.matrixSet,
	                    uid,
	                    token,
	                    function(json, error) {
	                        console.log('部件ID:'+uid);
	                        if (typeof error === 'undefined') {
	                            console.log("部件的节点信息",json);
	                        } else {
	                            console.log('error: ' + error);
	                        }
	                    });
	            });
            }


            // 
            Freedo.FdServer.FdPMTSParser.getUidBoundingSphere(pModelInfo.layer, pModelInfo.matrixSet,
                pModelInfo.matrix, componentID, token, undefined,
                function(bs, error) {
                    if (typeof error !== 'undefined') {
                        console.log('获取部件包围盒失败');
                        return;
                    }
                    console.log('部件包围盒信息: ' + bs);

                    // 以下代码提供飞入到某个部件处
                    // var heading = viewer.camera.heading;
                    // var pitch = viewer.camera.pitch;
                    // var range = bs.radius * 4.0;
                    // var offset = new Freedo.HeadingPitchRange(heading, pitch, range);

                    // viewer.camera.flyToBoundingSphere(bs, {
                    //     offset: offset
                    // });
                });

            pModelInfos.forEach(function(pModelInfo) {
                var pModel = pModelInfo.pModel;
                pModel.style = new Freedo.FreedoPModelStyle({});
            });

            pModel.style = new Freedo.FreedoPModelStyle({
                color: {
                    conditions: [
                        ['${component} ~== \'' + componentID + '\'',
                            'rgba(255, 0, 0, 1.0)'
                        ],
                        ['true', 'color("white")']
                    ]
                },
                show: 'true',
            });
        } else {
            // propListUI.propJson = {};

            pModelInfos.forEach(function(pModelInfo) {
                var pModel = pModelInfo.pModel;
                pModel.style = new Freedo.FreedoPModelStyle({});
            });
        }
    });

}, Freedo.ScreenSpaceEventType.LEFT_CLICK);