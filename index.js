$(function() {
  var calculateWaterLevelAndPaint = function(){
    // Calculate water level using flow rate and width
    var width = $('#width').val()
    var waterLevel = Math.round($("#flow-rate").val() / (width * 3.6) * 100) / 100

    $('#water-level').text(waterLevel)
    
    var visualRiverWidth = (width / 1000) * 90
    $('#flow-area, #water').css({ width: visualRiverWidth + '%'}).attr('x', 50 - visualRiverWidth / 2 + '%')
    $('#water').css({ height: waterLevel * 10 + '%'}).attr('y', 75 - (waterLevel * 10) + '%')
  }
  
  $('input').change(calculateWaterLevelAndPaint)
  calculateWaterLevelAndPaint()
})