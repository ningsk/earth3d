class EditPModel extends EditPBase {


  //外部更新位置
  setPositions(position) {
    if (util.isArray(position) && position.length == 1) {
      position = position[0];
    }
    this.entity.position = position;
    this.entity.modelMatrix = this.getModelMatrix();
  }
  getModelMatrix(position) {
    var cfg = this.entity.attribute.style;

    var hpRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(cfg.heading || 0), Cesium.Math.toRadians(cfg.pitch ||
      0), Cesium.Math.toRadians(cfg.roll || 0));
    var fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;

    var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position || this.entity.position, hpRoll, this.viewer
      .scene.globe.ellipsoid, fixedFrameTransform);

    // Cesium.Matrix4.multiplyByUniformScale(modelMatrix, Cesium.defaultValue(cfg.scale, 1), modelMatrix);
    return modelMatrix;
  }
  bindDraggers() {
    if (!this.entity.ready) {
      var that = this;
      this.entity.readyPromise.then(function(model) {
        that.bindDraggers();
      });
      return;
    }

    var that = this;

    this.entity.draw_tooltip = _Tooltip.message.dragger.def;

    var dragger = draggerCtl.createDragger(this.dataSource.entities, {
      dragger: this.entity,
      onDrag: function onDrag(dragger, newPosition) {
        that.entity.position = newPosition;
        that.entity.modelMatrix = that.getModelMatrix(newPosition);

        that.updateDraggers();
      }
    });

    var style = this.entity.attribute.style;

    var position = this.entity.position;
    var height = Cesium.Cartographic.fromCartesian(position).height;
    var radius = this.entity.boundingSphere.radius;

    if (!this.entity.attribute.noExDragger) {
      //辅助显示：创建角度调整底部圆
      this.entityAngle = this.dataSource.entities.add({
        name: '角度调整底部圆',
        position: new Cesium.CallbackProperty(function(time) {
          return that.entity.position;
        }, false),
        ellipse: circleAttr.style2Entity({
          "fill": false,
          "outline": true,
          "outlineColor": "#ffff00",
          "outlineOpacity": 0.8,
          "radius": radius,
          "height": height
        })
      });

      //创建角度调整 拖拽点
      var majorPos = this.getHeadingPosition();
      var majorDragger = draggerCtl.createDragger(this.dataSource.entities, {
        position: majorPos,
        type: draggerCtl.PointType.EditAttr,
        tooltip: _Tooltip.message.dragger.editHeading,
        onDrag: function onDrag(dragger, position) {
          var heading = that.getHeading(that.entity.position, position);
          style.heading = that.formatNum(heading, 1);

          that.entity.modelMatrix = that.getModelMatrix();
          dragger.position = that.getHeadingPosition();
        }
      });
      this.draggers.push(majorDragger);

      //缩放控制点 
      var position_scale = (0, _point.addPositionsHeight)(position, radius);
      var dragger = draggerCtl.createDragger(this.dataSource.entities, {
        position: position_scale,
        type: draggerCtl.PointType.MoveHeight,
        tooltip: _Tooltip.message.dragger.editScale,
        onDrag: function onDrag(dragger, positionNew) {
          var radiusNew = Cesium.Cartesian3.distance(positionNew, position);

          var radiusOld = dragger.radius / style.scale;
          var scaleNew = radiusNew / radiusOld;

          dragger.radius = radiusNew;
          style.scale = that.formatNum(scaleNew, 2);

          that.entity.scale = style.scale;
          // that.entity.modelMatrix = that.getModelMatrix();
          that.updateDraggers();
        }
      });
      dragger.radius = radius;
      this.draggers.push(dragger);
    }
  }
  destroyDraggers() {
    _EditP.EditPBase.prototype.destroyDraggers.call(this);

    if (this.entityAngle) {
      this.dataSource.entities.remove(this.entityAngle);
      delete this.entityAngle;
    }
  }
  //图形编辑结束后调用

  finish() {
    delete this.entity.draw_tooltip;
    delete this.entity._isDragger;
    delete this.entity._noMousePosition;
    delete this.entity._pointType;
    delete this.entity.onDrag;
  }
  getHeadingPosition() {
    //创建角度调整底部圆  
    var position = this.entity.position;
    var radius = this.entity.boundingSphere.radius;
    var angle = -Number(this.entity.attribute.style.heading || 0);

    var rotpos = new Cesium.Cartesian3(radius, 0.0, 0.0);

    var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle)));
    Cesium.Matrix4.multiply(mat, rotationX, mat);

    mat = Cesium.Matrix4.getMatrix3(mat, new Cesium.Matrix3());
    rotpos = Cesium.Matrix3.multiplyByVector(mat, rotpos, rotpos);
    rotpos = Cesium.Cartesian3.add(position, rotpos, rotpos);
    return rotpos;
  }
  //获取点相对于中心点的地面角度

  getHeading(positionCenter, positionNew) {

    //获取该位置的默认矩阵 
    var mat = Cesium.Transforms.eastNorthUpToFixedFrame(positionCenter);
    mat = Cesium.Matrix4.getMatrix3(mat, new Cesium.Matrix3());

    var xaxis = Cesium.Matrix3.getColumn(mat, 0, new Cesium.Cartesian3());
    var yaxis = Cesium.Matrix3.getColumn(mat, 1, new Cesium.Cartesian3());
    var zaxis = Cesium.Matrix3.getColumn(mat, 2, new Cesium.Cartesian3());

    //计算该位置 和  positionCenter 的 角度值
    var dir = Cesium.Cartesian3.subtract(positionNew, positionCenter, new Cesium.Cartesian3());
    //z crosss (dirx cross z) 得到在 xy平面的向量
    dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
    dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
    dir = Cesium.Cartesian3.normalize(dir, dir);

    var heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

    var ay = Cesium.Cartesian3.angleBetween(yaxis, dir);
    if (ay > Math.PI * 0.5) {
      heading = 2 * Math.PI - heading;
    }

    return -Cesium.Math.toDegrees(heading);
  }
}
export default EditPModel
