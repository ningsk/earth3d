/*
 * @Description: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2021-03-15 10:09:33
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-03-15 14:23:13
 */class TopoJsonLayer extends GeoJsonLayer {
    constructor(id, url, options = {}) {
        if (!url) {
            throw new Error('TopoJsonLayer锛歵he url invalid')
        }
        super(id, url, options)
        this.type = GeoJsonLayer.getLayerType('topojson')
        this._state = State.INITIALIZED
    }
}

GeoJsonLayer.registerType('topojson')

export default TopoJsonLayer