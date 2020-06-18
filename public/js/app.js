'use strict';

function showEditDetailsForm(event){
  $('#showForm').hide();
  $('.preState').hide();
  $('.update').show();
}

$('#showForm').on('click', showEditDetailsForm)