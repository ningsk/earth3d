class DrawWall extends DrawPolyline {
  //========== 构造方法 ==========
  constructor(opts) {
    super(opts)
    this.type = 'wall';
    this.attrClass = attr; //对应的属性控制静态类
    this.editClass = _Edit.EditWall; //获取编辑对象
    this._minPointNum = 2; //至少需要点的个数
    this._maxPointNum = 9999; //最多允许点的个数
    this.maximumHeights = null;
    this.minimumHeights = null;
  }

  //根据attribute参数创建Entity


  createFeature(attribute, dataSource) {
    dataSource = dataSource || this.dataSource;
    this._positions_draw = [];

    if (!this._minPointNum_def) this._minPointNum_def = this._minPointNum;
    if (!this._maxPointNum_def) this._maxPointNum_def = this._maxPointNum;

    if (attribute.config) {
      //允许外部传入
      this._minPointNum = attribute.config.minPointNum || this._minPointNum_def;
      this._maxPointNum = attribute.config.maxPointNum || this._maxPointNum_def;
    } else {
      this._minPointNum = this._minPointNum_def;
      this._maxPointNum = this._maxPointNum_def;
    }

    this.maximumHeights = [];
    this.minimumHeights = [];

    var that = this;
    var addattr = {
      wall: attr.style2Entity(attribute.style),
      attribute: attribute
    };
    addattr.wall.positions = new Cesium.CallbackProperty(function(time) {
      return that.getDrawPosition();
    }, false);
    addattr.wall.minimumHeights = new Cesium.CallbackProperty(function(time) {
      return that.getMinimumHeights();
    }, false);
    addattr.wall.maximumHeights = new Cesium.CallbackProperty(function(time) {
      return that.getMaximumHeights();
    }, false);

    this.entity = dataSource.entities.add(addattr); //创建要素对象
    return this.entity;
  }
  style2Entity(style, entity) {
    return attr.style2Entity(style, entity.wall);
  }
  getMaximumHeights(entity) {
    return this.maximumHeights;
  }
  getMinimumHeights(entity) {
    return this.minimumHeights;
  }
  updateAttrForDrawing() {
    var style = this.entity.attribute.style;
    var position = this.getDrawPosition();
    var len = position.length;

    this.maximumHeights = new Array(len);
    this.minimumHeights = new Array(len);

    for (var i = 0; i < len; i++) {
      var height = Cesium.Cartographic.fromCartesian(position[i]).height;
      this.minimumHeights[i] = height;
      this.maximumHeights[i] = height + Number(style.extrudedHeight);
    }
  }
  //获取外部entity的坐标到_positions_draw

  setDrawPositionByEntity(entity) {
    var positions = this.getPositions(entity);
    this._positions_draw = positions;

    var time = this.viewer.clock.currentTime;
    this._minimumHeights = entity.wall.minimumHeights && entity.wall.minimumHeights.getValue(time);
    this._maximumHeights = entity.wall.maximumHeights && entity.wall.maximumHeights.getValue(time);
    if (!this._minimumHeights || this._minimumHeights.length == 0 || !this._maximumHeights || this._maximumHeights
      .length == 0) return;

    entity.attribute.style = entity.attribute.style || {};
    entity.attribute.style.extrudedHeight = this._maximumHeights[0] - this._minimumHeights[0];
  }
  //图形绘制结束后调用

  finish() {
    var entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象
    // this.entity.wall.positions = this.getDrawPosition();
    // this.entity.wall.minimumHeights = this.getMinimumHeights();
    // this.entity.wall.maximumHeights = this.getMaximumHeights();

    entity._positions_draw = this.getDrawPosition();
    entity.wall.positions = new Cesium.CallbackProperty(function(time) {
      return entity._positions_draw;
    }, false);

    entity._minimumHeights = this.getMinimumHeights();
    entity.wall.minimumHeights = new Cesium.CallbackProperty(function(time) {
      return entity._minimumHeights;
    }, false);

    entity._maximumHeights = this.getMaximumHeights();
    entity.wall.maximumHeights = new Cesium.CallbackProperty(function(time) {
      return entity._maximumHeights;
    }, false);
  }
  class AttrWall {
    //属性赋值到entity
    static style2Entity(style, entityattr) {
      style = style || {};
  
      if (!entityattr) {
        entityattr = {
          fill: true
        };
      }
  
      //Style赋值值Entity
      for (var key in style) {
        var value = style[key];
        switch (key) {
          default:
            //直接赋值
            entityattr[key] = value;
            break;
          case "opacity": //跳过扩展其他属性的参数
          case "outlineOpacity":
          case "color": //填充颜色
          case "materialType":
  
          case "grid_lineCount":
          case "grid_lineThickness":
          case "grid_cellAlpha":
          case "checkerboard_repeat":
          case "checkerboard_oddcolor":
          case "stripe_oddcolor":
          case "stripe_repeat":
          case "animationDuration":
          case "animationImage":
          case "animationRepeatX":
          case "animationRepeatY":
          case "animationAxisY":
          case "animationGradient":
          case "animationCount":
          case "randomColor":
          case "distanceDisplayCondition_far":
          case "distanceDisplayCondition_near":
  
            break;
          case "outlineColor":
            //边框颜色
            entityattr.outlineColor = Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity ||
              style.opacity || 1.0);
            break;
  
          case "distanceDisplayCondition":
            //是否按视距显示
            if (value) {
              if (value instanceof Cesium.DistanceDisplayCondition) {
                entityattr.distanceDisplayCondition = value;
              } else {
                entityattr.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(Number(Cesium.defaultValue(
                  style.distanceDisplayCondition_near, 0)), Number(Cesium.defaultValue(style.distanceDisplayCondition_far,
                  100000)) + 6378137);
              }
            } else {
              entityattr.distanceDisplayCondition = undefined;
            }
            break;
  
          case "hasShadows":
            //阴影
            if (value) entityattr.shadows = Cesium.ShadowMode.ENABLED; //对象投射并接收阴影。
            else entityattr.shadows = Cesium.ShadowMode.DISABLED; //该对象不会投射或接收阴影
            break;
        }
      }
  
      //设置填充材质
      globe.setFillMaterial(entityattr, style);
  
      return entityattr;
    }
  
    //获取entity的坐标
    static getPositions(entity) {
      return entity.wall.positions.getValue((0, _util.currentTime)());
    }
  
    //获取entity的坐标（geojson规范的格式）
    static getCoordinates(entity) {
      var positions = getPositions(entity);
      var coordinates = pointconvert.cartesians2lonlats(positions);
      return coordinates;
    }
  
    //entity转geojson
    static toGeoJSON(entity) {
      var coordinates = getCoordinates(entity);
      return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
          type: "LineString",
          coordinates: coordinates
        }
      };
    }
  
  }
  export default AttrWall
  
}
export default DrawWall
