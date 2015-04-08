$('#search-form').ajaxForm({
	success	: function(responseText, status, xhr, $form){
		if (status == 'success') window.location.href = '/searchResult';
	},
	error : function(e){
        lv.showLoginError('Login Failure', 'Please check your username and/or password');
	}
}); 
