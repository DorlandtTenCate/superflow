$(function() {
  $('input').change(function(){
    // Calculate water level using flow rate and width
    var width = $('#width').val()
    var waterLevel = Math.round($("#flow-rate").val() / (width * 3.6) * 100) / 100

    $('#water-level').text(waterLevel)
    
    var visualRiverWidth = (width / 1000) * 90
    var visualRiverX = 50 - visualRiverWidth / 2

    $('#flow-area, #water').css({ width: visualRiverWidth + '%', x: visualRiverX + '%' })

  })
})