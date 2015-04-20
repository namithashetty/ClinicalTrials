
function SubscribeController()
{

// bind event listeners to button clicks //
	
	$('#searchResult-container #btn-subscribe').click(function(){ 
		console.log('Subscribe Controller');
		$('#get-subscribe').modal('show');});

}