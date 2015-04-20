
$(document).ready(function(){
	
	var sc = new SubscribeController();
	
// login retrieval form via email //
	
	var sev = new SubscribeEmailValidator();
	
	$('#subscribe-form').ajaxForm({
		url: '/subscribe',
		beforeSubmit : function(formData, jqForm, options){
			if (sev.validateEmail($('#email-tf').val())){
				sev.hideEmailAlert();
				return true;
			}	else{
				sev.showEmailAlert("<b> Error!</b> Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			sev.showEmailSuccess("Check your email to get updates on your subscribed studies.");
		},
		error : function(){
			sev.showEmailAlert("Sorry. There was a problem, please try again later.");
		}
	})
});
