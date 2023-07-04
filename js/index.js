;(function () {
  // 从服务器获取验证的图片数组
  var imgs = [
    './img/t1.png',
    './img/t2.png',
    './img/t3.png',
    './img/t4.png',
    './img/t5.png'
  ]
  // 封装两个获取dom元素的函数
  /**
   * @param {string} selector
   * @returns {Element}
   */
  function $(selector) {
    return document.querySelector(selector)
  }
  /**
   * @param {string} selector
   * @returns {NodeList}
   */
  function $$(selector) {
    return document.querySelectorAll(selector)
  }
  // 滑轨小球和拼图块是否在过渡动画中
  var isBallTransition = false
  var isPieceTransition = false
  // 获取需要操作的dom元素
  var doms = {
    validatorHead: $('.validator-head'),
    validatorMessage: $('.validator-message'),
    validatorImg: $('.validator-img'),
    validatorJigsawPiece: $('.validator-jigsaw-piece'),
    validatorMissingPiece: $('.validator-missing-piece'),
    validatorSlideway: $('.validator-slideway'),
    validatorSlidewayBall: $('.validator-slideway-ball')
  }
  // 获取固定的dom元素尺寸
  var domsSize = {
    validatorImgRect: doms.validatorImg.getBoundingClientRect(),
    validatorSlidewayRect: doms.validatorSlideway.getBoundingClientRect(),
    validatorSlidewayBallRect:
      doms.validatorSlidewayBall.getBoundingClientRect(),
    validatorJigsawPieceRect: doms.validatorJigsawPiece.getBoundingClientRect(),
    validatorMissingPiecesRect:
      doms.validatorMissingPiece.getBoundingClientRect()
  }
  // 定义初始化函数
  var init = function () {
    // 初始化拼图和滚动条
    initValidatorImgAndSlideway()
    // 初始化事件
    initEvents()
  }
  // 定义事件处理函数
  var eventHandlers = {
    /**
     * 拖动小球的鼠标按下事件
     * @param {MouseEvent} e
     * @this {HTMLElement}
     */
    mouseDownOnBall(e) {
      if (isBallTransition || isPieceTransition) {
        return
      }
      // 设置计时器和时间
      var time = 0
      var timer = setInterval(function () {
        time++
      }, 100)
      // 设置验证消息
      doms.validatorMessage.style.fontSize = 18 + 'px'
      doms.validatorMessage.innerHTML = '拖动图片完成验证'
      doms.validatorMessage.style.color = '#000'
      // 获取在小球上鼠标按下时的水平页面坐标
      var x = e.pageX
      // 设置拼图块显示
      doms.validatorJigsawPiece.style.display = 'block'
      // 设置滑轨文字颜色
      doms.validatorSlideway.style.color = '#ddd'
      // 获取小球和拼图块初始横向位置
      var ballLeft = parseInt(doms.validatorSlidewayBall.style.left) || -2
      var pieceLeft = parseInt(doms.validatorJigsawPiece.style.left) || 0
      function _windowOnMouseMove(e) {
        // 鼠标水平移动距离
        var movementX = e.pageX - x
        // 小球和拼图块新横向位置
        var ballNewLeft = ballLeft + movementX
        var pieceNewLeft = pieceLeft + movementX
        ballNewLeft = ballNewLeft <= ballLeft ? ballLeft : ballNewLeft
        pieceNewLeft = pieceNewLeft <= pieceLeft ? pieceLeft : pieceNewLeft
        var maxBallLeft =
          domsSize.validatorSlidewayRect.width -
          domsSize.validatorSlidewayBallRect.width -
          ballLeft
        var maxPieceLeft =
          domsSize.validatorImgRect.width -
          domsSize.validatorJigsawPieceRect.width
        ballNewLeft = ballNewLeft >= maxBallLeft ? maxBallLeft : ballNewLeft
        pieceNewLeft =
          pieceNewLeft >= maxPieceLeft ? maxPieceLeft : pieceNewLeft
        // 设置小球和拼图块为新横向位置
        doms.validatorSlidewayBall.style.left = ballNewLeft + 'px'
        doms.validatorJigsawPiece.style.left = pieceNewLeft + 'px'
      }
      function _windowOnMouseUp(e) {
        // 验证是否通过
        var res = validate()
        if (res) {
          // 清除定时器
          clearInterval(timer)
          // 设置验证消息
          doms.validatorMessage.style.fontSize = 14 + 'px'
          doms.validatorMessage.innerHTML =
            '验证成功，你的速度超过了' +
            (10000 / (100 + time)).toFixed(2) +
            '%的人'
          doms.validatorMessage.style.color = 'green'
          // 拼图块和缺失块消失
          doms.validatorJigsawPiece.style.display = 'none'
          doms.validatorMissingPiece.style.display = 'none'
          // 清除所有事件
          removeEvents()
          // 注册刷新事件
          doms.validatorHead.addEventListener('click', eventHandlers.refresh)
        } else {
          // 设置验证消息
          doms.validatorMessage.style.fontSize = 18 + 'px'
          doms.validatorMessage.innerHTML = '验证失败'
          doms.validatorMessage.style.color = 'red'
          // 为小球和拼图块添加过渡属性
          if (doms.validatorSlidewayBall.style.left !== ballLeft + 'px') {
            doms.validatorSlidewayBall.style.transition = 'all 0.5s'
          } else {
            // 滑轨文字颜色恢复
            doms.validatorSlideway.style.color = '#000'
          }
          if (doms.validatorJigsawPiece.style.left !== pieceLeft + 'px') {
            doms.validatorJigsawPiece.style.transition = 'all 0.5s'
          }
          // 小球和拼图块回到初始位置
          doms.validatorSlidewayBall.style.left = ballLeft + 'px'
          doms.validatorJigsawPiece.style.left = pieceLeft + 'px'
        }
        // 移除window上的两个事件
        window.removeEventListener('mousemove', _windowOnMouseMove)
        window.removeEventListener('mouseup', _windowOnMouseUp)
        // 手机适配
        window.removeEventListener('touchmove', _windowOnMouseMove)
        window.removeEventListener('touchend', _windowOnMouseUp)
      }
      window.addEventListener('mousemove', _windowOnMouseMove)
      window.addEventListener('mouseup', _windowOnMouseUp)
      // 手机适配
      window.addEventListener('touchmove', _windowOnMouseMove)
      window.addEventListener('touchend', _windowOnMouseUp)
    },
    // 小球过渡开始事件
    ballTransitionStart() {
      isBallTransition = true
    },
    // 小球过渡结束事件
    ballTransitionEnd() {
      doms.validatorSlidewayBall.style.transition = 'none'
      // 滑轨文字颜色恢复
      doms.validatorSlideway.style.color = '#000'
      isBallTransition = false
    },
    // 拼图块过渡开始事件
    pieceTransitionStart() {
      isPieceTransition = true
    },
    // 拼图块过渡结束事件
    pieceTransitionEnd() {
      doms.validatorJigsawPiece.style.transition = 'none'
      isPieceTransition = false
    },
    // 刷新事件
    refresh(e) {
      removeEvents()
      init()
    }
  }
  // 定义初始化事件函数
  function initEvents() {
    doms.validatorSlidewayBall.addEventListener(
      'mousedown',
      eventHandlers.mouseDownOnBall
    )
    doms.validatorSlidewayBall.addEventListener(
      'transitionstart',
      eventHandlers.ballTransitionStart
    )
    doms.validatorSlidewayBall.addEventListener(
      'transitionend',
      eventHandlers.ballTransitionEnd
    )
    doms.validatorJigsawPiece.addEventListener(
      'transitionstart',
      eventHandlers.pieceTransitionStart
    )
    doms.validatorJigsawPiece.addEventListener(
      'transitionend',
      eventHandlers.pieceTransitionEnd
    )
    doms.validatorHead.addEventListener('click', eventHandlers.refresh)
    // 手机适配
    doms.validatorSlidewayBall.addEventListener(
      'touchstart',
      eventHandlers.mouseDownOnBall
    )
  }
  // 定义清除所有事件函数
  function removeEvents() {
    doms.validatorSlidewayBall.removeEventListener(
      'mousedown',
      eventHandlers.mouseDownOnBall
    )
    doms.validatorSlidewayBall.removeEventListener(
      'transitionstart',
      eventHandlers.ballTransitionStart
    )
    doms.validatorSlidewayBall.removeEventListener(
      'transitionend',
      eventHandlers.ballTransitionEnd
    )
    doms.validatorJigsawPiece.removeEventListener(
      'transitionstart',
      eventHandlers.pieceTransitionStart
    )
    doms.validatorJigsawPiece.removeEventListener(
      'transitionend',
      eventHandlers.pieceTransitionEnd
    )
    doms.validatorHead.removeEventListener('click', eventHandlers.refresh)
    // 手机适配
    doms.validatorSlidewayBall.removeEventListener(
      'touchstart',
      eventHandlers.mouseDownOnBall
    )
  }
  // 定义生成随机浮点数函数
  function getFloatRadom(min, max) {
    return Math.random() * (max - min) + min
  }
  // 定义生成随机整数函数
  function getIntRadom(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
  }
  // 定义初始化拼图和滚动条函数
  function initValidatorImgAndSlideway() {
    // 获取一个随机整数
    var index = getIntRadom(0, imgs.length)
    // 初始化验证消息
    doms.validatorMessage.style.fontSize = 18 + 'px'
    doms.validatorMessage.innerHTML = '请完成图片验证'
    doms.validatorMessage.style.color = '#000'
    // 设置图片
    doms.validatorImg.style.backgroundImage = `url(${imgs[index]})`
    doms.validatorJigsawPiece.style.backgroundImage = `url(${imgs[index]})`
    // 设置拼图块隐藏和缺失块显示
    doms.validatorJigsawPiece.style.display = 'none'
    doms.validatorMissingPiece.style.display = 'block'
    // 随机获取并设置拼图块和缺失块纵向位置
    var top = getFloatRadom(
      0,
      domsSize.validatorImgRect.height -
        domsSize.validatorMissingPiecesRect.height
    )
    doms.validatorJigsawPiece.style.top = top + 'px'
    doms.validatorMissingPiece.style.top = top + 'px'
    doms.validatorJigsawPiece.style.backgroundPositionY = -top + 'px'
    // 随机获取并设置缺失块横向位置
    var left = getFloatRadom(
      domsSize.validatorImgRect.width * 0.4,
      domsSize.validatorImgRect.width -
        domsSize.validatorMissingPiecesRect.width
    )
    doms.validatorMissingPiece.style.left = left + 'px'
    doms.validatorJigsawPiece.style.backgroundPositionX = -left + 'px'
    // 初始化拼图块横向位置
    doms.validatorJigsawPiece.style.left = '0px'
    // 初始化拖动条小球位置和字体颜色
    doms.validatorSlideway.style.color = '#000'
    doms.validatorSlidewayBall.style.left = '-2px'
  }
  // 定义验证是否通过函数
  function validate() {
    // 获取拼图块和缺失块的横向位置
    var missingLeft = parseFloat(doms.validatorMissingPiece.style.left)
    var pieceLeft = parseFloat(doms.validatorJigsawPiece.style.left)
    // 检测二者相差距离
    var dis = Math.abs(missingLeft - pieceLeft)
    return dis <= 5
  }
  init()
})()
