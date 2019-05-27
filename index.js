$(function() {
  var calculateWaterLevelAndPaint = function(){
    // Calculate water level using flow rate and width
    var width = $('#width').val()
    var waterLevel = Math.round($("#flow-rate").val() / (width * 3.6) * 100) / 100

    // Display water level in text
    $('#water-level').text(waterLevel)
    
    // Calculated as percentage from meters
    var visualRiverWidth = (width / 1000) * 90
    var visualFlowAreaHeight = $('#depth').val() * 10
    var visualWaterHeight = waterLevel * 10
    var visualWaterTop = 50 + visualFlowAreaHeight - visualWaterHeight

    $('#flow-area, #water').css({ width: visualRiverWidth + '%'}).attr('x', 50 - visualRiverWidth / 2 + '%')
    $('#flow-area').css({ height: visualFlowAreaHeight + '%'}).attr('y' + '%')
    $('#water').css({ height: visualWaterHeight + '%'}).attr('y', visualWaterTop + '%')
  }

  $('input').change(calculateWaterLevelAndPaint)
  calculateWaterLevelAndPaint()
})