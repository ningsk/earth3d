import Cesium from "cesium";
import State from "../state/State";
import Layer from "./Layer";

/*
 * @Description: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2021-03-15 09:34:23
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-03-15 09:37:10
 */
class TilesetLayer extends Layer {
    constructor(id) {
        super(id)
        this._delegate = new Cesium.PrimitiveCollection()
        this.type = Layer.getLayerType('tileset')
        this._state = State.INITIALIZED
    }

    clear() {
        this._delegate.removeAll()
        this._cache = {}
        this._state = State.CLEARED
        return this
    }

}

Layer.registerType('tileset')

export default TilesetLayer