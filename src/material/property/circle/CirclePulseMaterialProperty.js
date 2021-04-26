import MaterialProperty from '../../MaterialProperty'

import * as Cesium from 'cesium'

class CirclePulseMaterialProperty extends MaterialProperty {
    constructor (options = {}) {
        super(options)
    }

    getType (time) {
        return Cesium.Material.CirclePulseType
    }

    getValue (time, result) {
        if (!result) {
            result = {}
        }
        result.color = Cesium.Property.getValueOrUndefined(this._color, time)
        result.speed = this._speed
        return result
    }

    equals (other) {
        return (
            this === other ||
            (other instanceof CirclePulseMaterialProperty &&
                Cesium.Property.equals(this._color, other._color) &&
                Cesium.Property.equals(this._speed, other._speed))
        )
    }
}

Object.defineProperties(CirclePulseMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed')
})

export default CirclePulseMaterialProperty
