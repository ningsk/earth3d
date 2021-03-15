/*
 * @Description: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2021-03-15 14:25:01
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-03-15 14:25:14
 */
import { LayerGroupEventType } from './EventType'
import Event from './Event'

import Cesium from "cesium"

class LayerGroupEvent extends Event {
    constructor() {
        super()
    }

    /**
     * Register event for layer group
     * @private
     */
    _registerEvent() {
        Object.keys(LayerGroupEventType).forEach(key => {
            let type = LayerGroupEventType[key]
            this._cache[type] = new Cesium.Event()
        })
    }
}

export default LayerGroupEvent