$(function() {
  $('input').change(function(){
    $('#water-level').text(Math.round($("#flow-rate").val() / ($('#width').val() * 3.6) * 100) / 100)
  })
})