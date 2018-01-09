import * as eases from 'eases-jsnext'

var AnimationCtrl = function (object, attr, to, time, type) {
  this.start = object[attr]
  this.distance = to - this.start
  this.object = object
  this.attr = attr
  this.time = time
  this.type = eases[type] ? type : 'linear'
  this.k = 0
  animationsList.push(this)
}
AnimationCtrl.prototype.nextStep = function(step) {
  this.k += step
  let x = this.k / this.time
  if (x > 1) {
    x = 1
  }
  this.object[this.attr] = this.distance * eases[this.type](x) + this.start
  if (x == 1) {
    return true
  }
}

export default AnimationCtrl