/*$('#search-form').ajaxForm({
	success	: function(responseText, status, xhr, $form){
		if (status == 'success') {
			window.location.href = '/searchResult';
			console.log("inside success of search.js")
		}
	},
});*/ 


$(document).ready(function(){
	
	var sc = new SearchController();

// main login form //

	$('#searchoutput-form').ajaxForm({
		success	: function(responseText, status, xhr, $form){
			console.log('Inside Search.js')
			if (status == 'success') window.location.href = '/searchResultOutput';
		}
	});