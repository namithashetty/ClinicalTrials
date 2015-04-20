
function SearchController(){

// handle search result //
	$('#search-btn').click(function(){ that.showSearchResults(); });
	
	this.showSearchResults = function()
	{
		var that = this;
		$.ajax({
			url: "/searchResult",
			type: "GET",
			success: function(data){
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
	}

}

LoginValidator.prototype.validateForm = function()
{
	if ($('#user-tf').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid username');
		return false;
	}	else if ($('#pass-tf').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid password');
		return false;
	}	else{
		return true;
	}
}