class GroupLayer extends BaseLayer {
  create() {
    this._layers = this.options._layers;
    var arr = this._layers;
    for (var i = 0, len = arr.length; i < len; i++) {
      this.hasOpacity = arr[i].hasOpacity;
      this.hasZIndex = arr[i].hasZIndex;
    }
  }
  //添加
  add() {
    this._visible = true;

    var arr = this._layers;
    for (var i = 0, len = arr.length; i < len; i++) {
      arr[i].visible = true;
    }
    _get(GroupLayer.prototype.__proto__ || Object.getPrototypeOf(GroupLayer.prototype), "add", this).call(this);
  }
  //移除
  remove() {
    this._visible = false;

    var arr = this._layers;
    for (var i = 0, len = arr.length; i < len; i++) {
      arr[i].visible = false;
    }
    _get(GroupLayer.prototype.__proto__ || Object.getPrototypeOf(GroupLayer.prototype), "remove", this).call(this);
  }
  //定位至数据区域
  centerAt(duration) {
    var arr = this._layers;
    for (var i = 0, len = arr.length; i < len; i++) {
      arr[i].centerAt(duration);
    }
  }
  //设置透明度
  setOpacity(value) {
    var arr = this._layers;
    for (var i = 0, len = arr.length; i < len; i++) {
      if (!arr[i].hasOpacity) continue;
      arr[i].setOpacity(value);
    }
  }
}
export default GroupLayer
