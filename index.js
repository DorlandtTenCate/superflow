$(function() {
  var calculateWaterLevelAndPaint = function() {
    // Calculate water level using flow rate and width
    var widthM = $('#width').val()
    var waterLevelM = Math.round($("#flow-rate").val() / (widthM * 3.6) * 100) / 100

    // Display water level in text
    $('#water-level').text(waterLevelM)

    var riverWidthU = (widthM / 1000) * 900
    var flowAreaHeightU = $('#depth').val() * 100
    var waterHeightU = waterLevelM * 100
    var waterTopU = 500 + flowAreaHeightU - waterHeightU
    var waterWidthU = riverWidthU * Math.sin(waterHeightU / flowAreaHeightU * 0.5 * Math.PI)

    $('#flow-area').attr('d', ['M', 500 - riverWidthU / 2, 500, 'a', riverWidthU / 2, flowAreaHeightU, 0, 0, 0, riverWidthU, 0].join(' '))
    // $('#water').attr('d', ['M', 500 - waterWidthU / 2, 500 + (flowAreaHeightU - waterHeightU), 'a', waterWidthU / 2, waterHeightU, 0, 0, 0, waterWidthU, 0].join(' '))
    $('#flow-area, #water').css({ width: riverWidthU / 10 + '%'}).attr('x', 50 - riverWidthU / 20 + '%')
    $('#flow-area').css({ height: flowAreaHeightU + '%'}).attr('y' + '%')
    $('#water').css({ height: waterHeightU / 10 + '%'}).attr('y', waterTopU / 10 + '%')
  }

  $('input').change(calculateWaterLevelAndPaint)
  calculateWaterLevelAndPaint()
})