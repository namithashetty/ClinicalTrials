
$(document).ready(function(){
	
	var sc = new SearchController();

// main login form //

	$('#searchoutput-form').ajaxForm({
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') window.location.href = '/searchResultOutput';
		}
	});
});