$(function() {
  $('input').change(function(){
    // Calculate water level using flow rate and width
    var width = $('#width').val()
    var waterLevel = Math.round($("#flow-rate").val() / (width * 3.6) * 100) / 100

    $('#water-level').text(waterLevel)
    
    var visualRiverWidth = (width / 1000) * 90
    var visualRiverX = 50 - visualRiverWidth / 2
    
    // vb   water level 4 meter dan is waar hij begint 50% van boven
    // hoogte is =
    
    var visualWaterY = 90 - (waterLevel * 10)
    var visualWaterHeight = waterLevel * 10

    $('#flow-area, #water').css({ width: visualRiverWidth + '%', x: visualRiverX + '%' })
    $('#water').css({ height: visualWaterHeight + '%', y: visualWaterY + '%'})

  })
})