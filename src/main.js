import * as three from 'three'
import {Stats} from 'three-stats'
import shaders from 'three-shaders'
import * as postprocessing from 'postprocessing'
import OBJLoader from 'three-obj-loader'

import AnimationCtrl from './AnimationCtrl.js'

import './style.css'

var logoImg = require('./assets/logo-img.png')
document.querySelector('#ogimg').setAttribute('content', logoImg)

const isWebglEnabled = require('detector-webgl')

var THREE = new Object()
OBJLoader(THREE)
Object.assign(THREE, three, shaders, postprocessing)

var world = require('./world-simplified.json')

var deg = Math.PI / 180
var myCanvas, ctx
var container, stats
var camera, scene, renderer, composer
var group, group2, ellipse, boaderImg, plane
var clock
var cameraZ = 500
var planeRotation = 0
var targetRotation = new THREE.Vector2(230 * deg, 30 * deg)
var mousePos = new THREE.Vector3(0, 0, 0)
var aimMousePos = new THREE.Vector2(0, 0)
var mouseX = 0
var mouseXOnMouseDown = 0
var mouseY = 0
var mouseYOnMouseDown = 0
var windowX = window.innerWidth
var windowY = window.innerHeight
var windowHalfX = windowX / 2
var windowHalfY = windowY / 2

window.animationsList = []
var effectGlitch, effectCopy, effectFXAA

var randomRects = []
window.randomNoise = []
var randomCodes = []
var codesTimer = 0
var bgRects = []
function resetBgRects() {
  bgRects[0] = {
    x: Math.random() * 10 - 132,
    y: Math.random() * 10 - 10,
    w: Math.random() * 10 + 50,
    h: Math.random() * 10 + 54
  }
  bgRects[1] = {
    x: Math.random() * 10 - 148,
    y: Math.random() * 10 + 12,
    w: Math.random() * 10 + 40,
    h: Math.random() * 10 + 40
  }
  bgRects[2] = {
    x: Math.random() * 10 - 156,
    y: Math.random() * 10 - 5,
    w: Math.random() * 10 + 40,
    h: Math.random() * 10 + 30
  }
}
resetBgRects()
var noiseAppearWait = 2
var noiseAppearHold = 1.4
var noiseAppearRate = 100
var canvasTimer = 0

var contact, rotate

var mainContent
var svgCenter, svgLink, content
var svgGroups = []
var baseSvgPoss = [
  [
    new THREE.Vector4(-210, 160, 1, 0),
    new THREE.Vector4(150, -87, 0.7, 0),
    new THREE.Vector4(-90, -210, 0.4, 0)
  ],
  [
    new THREE.Vector4(-178, -108, 1, 1),
    new THREE.Vector4(138, -180, 0.7, 0),
    new THREE.Vector4(-84, -240, 0.4, 0)
  ],
  [
    new THREE.Vector4(145, 125, 0.7, 0),
    new THREE.Vector4(-178, -108, 1, 1),
    new THREE.Vector4(78, -228, 0.7, 0)
  ],
  [
    new THREE.Vector4(-154, 224, 0.4, 0),
    new THREE.Vector4(250, 87, 0.7, 0),
    new THREE.Vector4(-178, -108, 1, 1)
  ]
]
var svgAimPoss = [
  new THREE.Vector4(-210, 160, 1, 0),
  new THREE.Vector4(150, -87, 0.7, 0),
  new THREE.Vector4(-90, -210, 0.4, 0)
]
var svgTimer = 0, foucsIndex = 0
const svgContents = [
  'DoraHacks is a global hackathon organizer and hacker organization founded in 2014, with support from Open Wisdom Lab at Tsinghua University.' ,
  'DoraHacks\' mission is to connect hackers around the world to the greatest problems we face in industries and society.',
  'DoraHacks has formed a unique and irreplaceable "Hacker Brain" for the society. More than 100 hackathons have been organized, 10000+ hackers involved and more than 1000 problems have been solved at DoraHacks\' hackathons.'
]
const inputTextStep = 80
var textAccuracy = 0
var inputString = ''
var errorString = '', showString = ''
var buttons, prev, next

var r = 180
var longNum = 240
var latNum = 120
var dLong = 360 / longNum
var dLat = 180 / latNum
var pointSize = 2.2

var bgColor = 0x000000

myinit()
initPoints()
initAnimation()
animate()

function myinit() {
  clock = new THREE.Clock()

  myCanvas = document.querySelector('#myCanvas')
  myCanvas.width = windowX
  myCanvas.height = windowY
  ctx = myCanvas.getContext('2d')

  svgCenter = document.querySelector('#svg-center')
  svgCenter.style.transform = 'translate3d(' + windowHalfX + 'px, ' + windowHalfY + 'px, 0)'
  svgGroups = document.querySelectorAll('.svg-group')
  for (let i = 0; i < svgGroups.length; i++) {
    svgGroups[i].onmousedown = function () {
      showContent(i)
    }
    svgGroups[i].ontouchstart = function () {
      showContent(i)
    }
  }
  buttons = document.querySelector('.buttons')
  prev = document.querySelector('#prev')
  prev.onmousedown = function () {
    showContent(foucsIndex - 2)
  }
  prev.ontouchstart = function () {
    showContent(foucsIndex - 2)
  }
  next = document.querySelector('#next')
  next.onmousedown = function () {
    showContent(foucsIndex)
  }
  next.ontouchstart = function () {
    showContent(foucsIndex)
  }
  svgLink = document.querySelector('.svg-link')
  mainContent = document.querySelector('#main-content')
  content = document.querySelector('#main-content>p')

  rotate = document.querySelector('#rotate')

  contact = document.querySelector('#contact')
  contact.onclick = function () {
    contact.className = 'contact on-show'
    contact.onclick = null
    contact.ontouchstart = null
  }
  contact.ontouchstart = function () {
    contact.className = 'contact on-show'
    contact.onclick = null
    contact.ontouchstart = null
  }
  document.querySelector('.close').onclick = function (event) {
    event.stopPropagation()
    contact.className = 'contact'
    setTimeout(() => {
      contact.onclick = function () {
        contact.className = 'contact on-show'
        contact.onclick = null
        contact.ontouchstart = null
      }
      contact.ontouchstart = function () {
        contact.className = 'contact on-show'
        contact.onclick = null
        contact.ontouchstart = null
      }
    }, 400)
  }
  document.querySelector('.close').ontouchstart = function () {
    event.stopPropagation()
    contact.className = 'contact'
    setTimeout(() => {
      contact.onclick = function () {
        contact.className = 'contact on-show'
        contact.onclick = null
        contact.ontouchstart = null
      }
      contact.ontouchstart = function () {
        contact.className = 'contact on-show'
        contact.onclick = null
        contact.ontouchstart = null
      }
    }, 400)
  }

  if (windowY > windowX) {
    rotate.style.display = 'block'
    mainContent.style.display = 'none'
    svgCenter.style.display = 'none'
    contact.style.display = 'none'
  }

  if (!container) {
    container = document.createElement('div')
    document.body.insertBefore(container, myCanvas)
  }
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(bgColor, 260, 800)
  scene.background = new THREE.Color(bgColor)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 0, 500)
  scene.add(camera)

  group = new THREE.Group()
  scene.add(group)
  group2 = new THREE.Group()
  group2.rotation.z = 30 * deg
  group.add(group2)

  var curve = new THREE.EllipseCurve(
    0,  0,            // ax, aY
    200, 200,         // xRadius, yRadius
    0,  2 * Math.PI,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  )
  var points = curve.getPoints(60)
  var geometry = new THREE.Geometry().setFromPoints(points)
  geometry.computeLineDistances()

  var material = new THREE.LineDashedMaterial({
    color: 0xF26F21,
    scale: 1,
    dashSize: 5,
    gapSize: 16
  })

  ellipse = new THREE.Line(geometry, material)
  ellipse.position.set(0, 0, 0)
  camera.add(ellipse)

  var tempImg = new Image()
  tempImg.onload = () => {
    boaderImg = tempImg
  }
  tempImg.src = require('./assets/boader.png')

  let img = document.createElement('img')
  img.src = require('./assets/logo.png')
  img.width = 280
  document.querySelector('.logo').appendChild(img)

  var loader = new THREE.OBJLoader()
  loader.load(require('./assets/antonov_an_71.obj'), function (object) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh){
        child.material = new THREE.MeshBasicMaterial({
          color: 0xF26F21,
          opacity: 0.5,
          wireframe: true,
          transparent: true
        })
      }
    })
    plane = object
    plane.scale.set(10, 10, 10)
    plane.position.y = 250
    var curve = new THREE.EllipseCurve(
      0,  0,            // ax, aY
      260, 260,         // xRadius, yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
    )
    var points = curve.getPoints(60)
    var geometry = new THREE.Geometry().setFromPoints(points)
    geometry.computeLineDistances()

    var material = new THREE.LineDashedMaterial({
      color: 0xF26F21,
      scale: 1,
      dashSize: 5,
      gapSize: 16
    })

    var ellipse = new THREE.Line(geometry, material)
    ellipse.rotation.y = 90 * deg
    group2.add(ellipse)

    group2.add(plane)
  })
}

function initPoints() {
  var boundary = []
  world.map((countryInfo) => {
    var coordinates = countryInfo.coordinates
    for (var i = 0; i < coordinates.length; i++) {
      var polygon = coordinates[i]
      var lastPoint = polygon[0]
      var nextPoint = []
      for (var j = 1; j < polygon.length; j++) {
        nextPoint = polygon[j]
        var minLat = Math.min(lastPoint[1], nextPoint[1])
        var maxLat = Math.max(lastPoint[1], nextPoint[1])
        var startLat = Math.ceil(minLat / dLat) * dLat
        var k = (nextPoint[0] - lastPoint[0]) / (nextPoint[1] - lastPoint[1])
        for (var lat = startLat; lat < maxLat; lat += dLat) {
          var long = k * (lat - lastPoint[1]) + lastPoint[0]
          var index = Math.round((lat + 90) / dLat) + 1
          if (boundary[index] == undefined) {
            boundary[index] = new Array()
          }
          boundary[index].push(long)
        }
        lastPoint = nextPoint
      }
    }
  })

  for (var i = 0; i < boundary.length; i++) {
    if (boundary[i]) {
      boundary[i].push(-180,180)
      break
    }
    boundary[i] = [-180, 180]
  }

  var points = []
  var borders = []
  boundary = boundary.map((longList, latOrder) => {
    longList.sort((a, b) => {return a - b})
    var lat = (latOrder + 1) * dLat - 90

    var minLong = longList[0]
    var maxLong = longList[longList.length - 1]
    var dis = lat * lat / 90
    var startLong = Math.ceil((minLong - dis) / dLong) * dLong + dis
    var left = 0
    var right = 1
    var isInside = true
    
    var cosLat = Math.cos(lat * deg)
    var sinLat = Math.sin(lat * deg)
    for (var long = startLong; long < maxLong; long += dLong) {
      while (long > longList[right]) {
        right++
        isInside = !isInside
      }
      if (isInside) {
        var x = r * Math.sin(long * deg) * cosLat
        var y = r * sinLat
        var z = r * Math.cos(long * deg) * cosLat
        var point = new THREE.Vector3(x, y, z)
        points.push(point)
      }
    }

    for (var i = 0; i < longList.length; i++) {
      var long = longList[i]
      var x = r * Math.sin(long * deg) * cosLat
      var y = r * sinLat
      var z = r * Math.cos(long * deg) * cosLat
      var point = new THREE.Vector3(x, y, z)
      borders.push(point)
    }

    return longList
  })

  var particles = new THREE.Points(new THREE.BufferGeometry().setFromPoints(points), new THREE.PointsMaterial({
    color: 0xFC7632,
    size: pointSize,
    opacity: 0.7,
    transparent: true
  }))
  group.add(particles)

  renderer = new THREE.WebGLRenderer({antialias: !isWebglEnabled })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

//------------------------------------------------------------------------------------

  var renderPass = new THREE.RenderPass(scene, camera)
  // var hblur = new THREE.ShaderPass(new THREE.ShaderMaterial(THREE.HorizontalTiltShiftShader()))
  // Object.assign(hblur.material.uniforms, {
  //   r: {value: 0.5},
  //   h: {value: 0.8 / windowHalfX}
  // })
  // var vblur = new THREE.ShaderPass(new THREE.ShaderMaterial(THREE.VerticalTiltShiftShader()))
  // Object.assign(vblur.material.uniforms, {
  //   r: {value: 0.5},
  //   v: {value: 0.8 / windowHalfY}
  // })
  effectFXAA = new THREE.ShaderPass(new THREE.ShaderMaterial(THREE.FXAAShader()))
  effectFXAA.material.uniforms['resolution'].value.set(1 / windowX / window.devicePixelRatio, 1 / windowY / window.devicePixelRatio)
  effectCopy = new THREE.ShaderPass(new THREE.ShaderMaterial(THREE.CopyShader()))
  effectCopy.renderToScreen = true
  effectGlitch = new THREE.GlitchPass({dtSize: 32})
  effectGlitch.renderToScreen = true
  effectGlitch.mode = 1
  effectGlitch.enabled = false
  
  var renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false
  }
  var renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)
  composer = new THREE.EffectComposer(renderer, renderTarget)

  composer.addPass(renderPass)
  composer.addPass(effectFXAA)
  // composer.addPass(hblur)
  // composer.addPass(vblur)
  composer.addPass(effectCopy)
  composer.addPass(effectGlitch)

//------------------------------------------------------------------------------------

  stats = new Stats()
  // container.appendChild(stats.dom)

  document.addEventListener('mousemove', getMousePos, false)
  document.addEventListener('mouseout', resetMousePos, false)
  document.addEventListener('mousedown', onDocumentMouseDown, false)
  document.addEventListener('touchstart', onDocumentTouchStart, false)
  document.addEventListener('touchmove', onDocumentTouchMove, false)
  document.addEventListener('touchend', () => {
    mousePos.z = 1
  }, false)
  window.addEventListener('resize', onWindowResize, false)
}

function getMousePos(event) {
  let x = (event.clientX - windowHalfX) / windowHalfX
  let y = (event.clientY - windowHalfY) / windowHalfY
  mousePos.set(x, y, 0)
}
function resetMousePos() {
  mousePos.z = 1
}
function onWindowResize() {
  windowX = window.innerWidth
  windowY = window.innerHeight
  let ua = navigator.userAgent
  if (ua.indexOf("iPhone") > -1 && windowY > windowX) {
    windowX /= windowY
    windowY = 1000
    windowX = Math.ceil(windowX * 1000)
  }
  windowHalfX = windowX / 2
  windowHalfY = windowY / 2
  camera.aspect = windowX / windowY
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(windowX, windowY)
  composer.setSize(windowX, windowY)
  effectFXAA.material.uniforms['resolution'].value.set(1 / windowX / window.devicePixelRatio, 1 / windowY / window.devicePixelRatio)
  myCanvas.width = windowX
  myCanvas.height = windowY
  svgCenter.style.transform = 'translate3d(' + windowHalfX + 'px, ' + windowHalfY + 'px, 0)'

  if (windowY > windowX) {
    rotate.style.display = 'block'
    mainContent.style.display = 'none'
    svgCenter.style.display = 'none'
    contact.style.display = 'none'
  } else {
    rotate.style.display = 'none'
    mainContent.style.display = 'block'
    svgCenter.style.display = 'block'
    contact.style.display = 'block'
  }
}
//
function onDocumentMouseDown (event) {
  // event.preventDefault()
  shake()
  document.addEventListener('mousemove', onDocumentMouseMove, false)
  document.addEventListener('mouseup', onDocumentMouseUp, false)
  mouseXOnMouseDown = event.clientX - windowHalfX
  mouseYOnMouseDown = event.clientY - windowHalfY
}
function onDocumentMouseMove (event) {
  mouseX = event.clientX - windowHalfX
  mouseY = event.clientY - windowHalfY
  targetRotation.x += ( mouseX - mouseXOnMouseDown ) / windowHalfX
  targetRotation.y += ( mouseY - mouseYOnMouseDown ) / windowHalfY
  mouseXOnMouseDown = mouseX
  mouseYOnMouseDown = mouseY
  if (targetRotation.y > 45 * deg) {
    targetRotation.y = 45 * deg
  } else if (targetRotation.y < -45 * deg) {
    targetRotation.y = -45 * deg
  }
}
function onDocumentMouseUp (event) {
  document.removeEventListener('mousemove', onDocumentMouseMove, false)
  document.removeEventListener('mouseup', onDocumentMouseUp, false)
}
function onDocumentTouchStart (event) {
  if ( event.touches.length == 1 ) {
    shake()
    // event.preventDefault()
    mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX
    mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY
  }
}
function onDocumentTouchMove (event) {
  if ( event.touches.length == 1 ) {
    event.preventDefault()
    mouseX = event.touches[ 0 ].pageX - windowHalfX
    mouseY = event.touches[ 0 ].pageY - windowHalfY
    targetRotation.x += ( mouseX - mouseXOnMouseDown ) / windowHalfX
    targetRotation.y += ( mouseY - mouseYOnMouseDown ) / windowHalfY
    mouseXOnMouseDown = mouseX
    mouseYOnMouseDown = mouseY
    if (targetRotation.y > 45 * deg) {
      targetRotation.y = 45 * deg
    } else if (targetRotation.y < -45 * deg) {
      targetRotation.y = -45 * deg
    }
    mousePos.set(mouseX / windowHalfX, mouseY / windowHalfY, 0)
  }
}
var shakeTimer
function shake() {
  if (shakeTimer) {
    clearTimeout(shakeTimer)
  } else {
    effectCopy.enabled = false
    effectGlitch.enabled = true
  }
  shakeTimer = setTimeout(() => {
    effectGlitch.enabled = false
    effectCopy.enabled = true
    shakeTimer = null
  }, 500)
}

function initAnimation() {
  new AnimationCtrl(ellipse.position, 'z', -400, 1, 'expoOut')
  document.querySelector('#mask').className = 'none'
  setTimeout(() => {
    document.querySelector('#mask').style.display = 'none'
  })
}

function animate() {
  requestAnimationFrame(animate)
  render()
  stats.update()
}
function render() {
  var delta = clock.getDelta()
  if (delta > 0.5) {
    delta = 0.016
  }

  for (var i = 0; i < animationsList.length; i++) {
    let discard = animationsList[i].nextStep(delta)
    if (discard) {
      animationsList.splice(i, 1)
      i--
    }
  }

  targetRotation.x += deg * delta * 6
  group.rotation.y += ( targetRotation.x - group.rotation.y ) * delta * 3
  group.rotation.x += ( targetRotation.y - group.rotation.x ) * delta * 3

  ellipse.rotation.z -= deg * delta * 2

  if (plane) {
    planeRotation += deg * delta * 16
    let y = Math.cos(planeRotation) * 250
    let z = Math.sin(planeRotation) * 250
    plane.position.set(0, y, z)
    plane.rotation.x = planeRotation

    group2.rotation.y += deg * delta * 4
  }

  camera.position.z += (cameraZ - camera.position.z) * delta * 3

  if (isWebglEnabled) {
    composer.render(delta)
  } else {
    renderer.render(scene, camera)
  }

  draw(delta)
  svgCtrl(delta)
}
function draw(delta) {
  canvasTimer += delta
  codesTimer += delta
  if (canvasTimer > noiseAppearWait + noiseAppearHold) {
    canvasTimer = 0
    noiseAppearWait = Math.random() * 4 + 4
    noiseAppearHold = Math.random() * 0.8 + 1
  } else if (canvasTimer > noiseAppearWait) {
    let t = (canvasTimer - noiseAppearWait) / noiseAppearHold * Math.PI
    noiseAppearRate = 20 - Math.sin(t) * 19
  }
  if (Math.random() < 1 / noiseAppearRate) {
    let x = Math.pow(Math.random(), 2) * 500 - 250
    let y = (250 - Math.abs(x)) * (Math.random() * 2 - 1) * 0.3
    let w = Math.random() * 200 + 30
    let h = (Math.random() * 300 + 600) / w
    let l = Math.random() * 6 + 2
    randomRects.push({x, y, w, h, l})
  }
  if (Math.random() > 0.93) {
    let x = Math.random() * 1.8 - 0.9
    let y = (0.9 - Math.pow(x, 2)) * (Math.random() * 0.2 + 0.8) * (Math.random() < 0.5 ? 1 : -1)
    let w = Math.random() * 10 + 10
    let h = (Math.random() * 250 + 50) / w
    let l = Math.random() * 6 + 4
    randomNoise.push({x, y, w, h, l})
  }
  if (randomCodes.length < 10 && codesTimer > 3) {
    codesTimer = Math.random()
    randomCodes.push({
      size: parseInt(Math.random() * 11) + 10,
      y: Math.random() * 0.9 + 0.05,
      x: 1,
      o: Math.random() * 0.4 + 0.2,
      speed: 0.001
    })
  }
  ctx.clearRect(0, 0, windowX, windowY)
  ctx.save()
  ctx.save()
  ctx.fillStyle = '#F26F21'
  for (var i = 0; i < randomCodes.length; i++) {
    let r = randomCodes[i]
    ctx.globalAlpha = r.o
    r.x -= r.speed * delta * 60
    if (r.x < -0.2) {
      randomCodes.splice(i, 1)
      i--
    } else {
      ctx.font = r.size + "px sans-serif"
      ctx.fillText("-.. --- .-. .- .... .- -.-. -.- ...", r.x * windowX, r.y * windowY)
    }
  }
  ctx.globalAlpha = 1
  for (var i = 0; i < randomNoise.length; i++) {
    let r = randomNoise[i]
    if (--randomNoise[i].l < 0) {
      randomNoise.splice(i, 1)
      i--
    } else {
      let r = randomNoise[i]
      ctx.fillRect(windowHalfX * (1 + r.x) - r.w / 2, windowHalfY * (1 + r.y) - r.h / 2, r.w, r.h)
    }
  }
  ctx.translate(windowX * 0.08 + 160, windowY * 0.08 + 30)
  for (var i = 0; i < randomRects.length; i++) {
    if (--randomRects[i].l < 0) {
      randomRects.splice(i, 1)
      i--
    } else {
      let r = randomRects[i]
      ctx.fillRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h)
    }
  }
  // if (Math.random() > 0.8) {
  //   resetBgRects()
  // }
  // for (var i = 0; i < bgRects.length; i++) {
  //   let r = bgRects[i]
  //   ctx.fillRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h)
  // }
  ctx.restore()
  ctx.translate(windowHalfX, windowHalfY)
  if (boaderImg) {
    let power = 3 * delta
    aimMousePos.x += (mousePos.x - aimMousePos.x) * power
    aimMousePos.y += (mousePos.y - aimMousePos.y) * power
    let s = 1.15 - aimMousePos.y * 0.25
    let r = aimMousePos.x * 0.5
    ctx.save()
    ctx.scale(s, s)
    ctx.rotate(r)
    ctx.drawImage(boaderImg, -windowHalfX * 0.9, -boaderImg.height / 2)
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(boaderImg, -windowHalfX * 0.9, -boaderImg.height / 2)
    ctx.restore()
    ctx.restore()
    if (mousePos.z) {
      mousePos.x *= (1 - power)
      mousePos.y *= (1 - power)
    }
  }
  ctx.restore()
}
function svgCtrl(delta) {
  svgTimer += delta
  let r = Math.sin(svgTimer) * 20
  var d = ['M']
  var svgPoss = baseSvgPoss[foucsIndex]
  for (var i = 0; i < svgGroups.length; i++) {
    let power =  4.8 * delta
    svgAimPoss[i].x += (svgPoss[i].x - svgAimPoss[i].x) * power
    svgAimPoss[i].y += (svgPoss[i].y - svgAimPoss[i].y) * power
    svgAimPoss[i].z += (svgPoss[i].z - svgAimPoss[i].z) * power
    svgAimPoss[i].w = svgPoss[i].w
    let pos = svgAimPoss[i]
    let dx = pos.w ? 0 : r * Math.sin(i + svgTimer * 0.7692) * pos.z
    let dy = pos.w ? 0 : r * Math.cos(i + svgTimer * 0.5882) * pos.z
    let transform = 'translate3d(' + (pos.x + dx - 13) + 'px, ' + (pos.y + dy - 15) + 'px, 0) scale(' + pos.z + ', ' + pos.z + ')'
    svgGroups[i].style.transform = transform
    d.push(pos.x + dx, pos.y + dy, 'L')
  }
  d.pop()
  svgLink.setAttribute('d', d.join(' '))
  updateText()
}
function showContent(index) {
  cameraZ = 600
  if (foucsIndex == index + 1) {
    hideContent()
    return
  }
  document.querySelector('#svg-notice').style.display = 'none'
  foucsIndex = index + 1
  buttons.className = 'buttons-fade'
  setTimeout(() => {
    if (index == 0) {
      prev.style.display = 'none'
    } else {
      prev.style.display = 'inline-block'
    }
    if (index == 2) {
      next.style.display = 'none'
    } else {
      next.style.display = 'inline-block'
    }
    buttons.className = 'buttons'
  }, 1000)
  for (var i = 0; i < svgGroups.length; i++) {
    svgGroups[i].setAttribute('class', 'svg-group')
  }
  svgGroups[index].setAttribute('class', 'svg-group focus')
  textAccuracy = 0
  content.innerHTML = ''
  showString = ''
  inputString = svgContents[index]
}
function hideContent() {
  cameraZ = 500
  foucsIndex = 0
  buttons.className = 'buttons-fade'
  setTimeout(() => {
    prev.style.display = 'none'
    next.style.display = 'none'
    buttons.className = 'buttons'
  }, 1000)
  for (var i = 0; i < svgGroups.length; i++) {
    svgGroups[i].setAttribute('class', 'svg-group')
  }
  textAccuracy = 0
  content.innerHTML = ''
  showString = ''
  inputString = ''
}
function updateText() {
  var text = content.innerHTML
  if (showString != inputString) {
    if (textAccuracy++ % 5 == 0) {
      for (var i = 0; i < inputString.length; i++) {
        let randomIndex = parseInt(Math.random() * 26) + 65 + (Math.random() < 0.5 ? 32 : 0)
        errorString += String.fromCharCode(randomIndex)
      }
    }
    showString = ''
    for (var i = 0; i < inputString.length; i++) {
      if (text[i] == inputString[i]) {
        showString += text[i]
      } else {
        showString += Math.random() < textAccuracy / inputTextStep ? inputString[i] : errorString[i]
      }
    }
    content.innerHTML = showString
  }
}