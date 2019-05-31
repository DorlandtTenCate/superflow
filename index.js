$(function() {
  var calculateWaterLevelAndPaint = function(){
    // Calculate water level using flow rate and width
    var width = $('#width').val()
    var waterLevel = Math.round($("#flow-rate").val() / (width * 3.6) * 100) / 100

    // Display water level in text
    $('#water-level').text(waterLevel)
    
    // Calculated as percentage from meters
    var visualRiverWidth = (width / 1000) * 900
    var visualFlowAreaHeight = $('#depth').val() * 100
    var visualWaterHeight = waterLevel * 100
    var visualWaterTop = 50 + visualFlowAreaHeight - visualWaterHeight

    $('#flow-area').attr('d', ['M', 500 - visualRiverWidth / 2, 500, 'a', visualRiverWidth / 2, visualFlowAreaHeight, 0, 0, 0, visualRiverWidth, 0].join(' '))

    // $('#flow-area, #water').css({ width: visualFlowAreaWidth + '%'}).attr('x', 50 - visualRiverWidth / 2 + '%')
    // $('#flow-area').css({ height: visualFlowAreaHeight + '%'}).attr('y' + '%')
    // $('#water').css({ height: visualWaterHeight + '%'}).attr('y', visualWaterTop + '%')
  }

  $('input').change(calculateWaterLevelAndPaint)
  calculateWaterLevelAndPaint()
})