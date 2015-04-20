
function SubscribeEmailValidator(){

// bind this to _local for anonymous functions //

    var _local = this;

// modal window to allow users to request credentials by email //
	_local.subscribeStudy = $('#get-subscribe');
	_local.subscribeStudy.modal({ show : false, keyboard : true, backdrop : true });
	_local.retrieveSubscribeAlert = $('#get-subscribe .alert');
	_local.retrieveSubscribeAlert.on('show', function(){ $('#subscribe-form').resetForm(); _local.retrieveSubscribeAlert.hide();});

}

SubscribeEmailValidator.prototype.validateEmail = function(e)
{
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(e);
}

SubscribeEmailValidator.prototype.showEmailAlert = function(m)
{
	this.retrieveSubscribeAlert.attr('class', 'alert alert-error');
	this.retrieveSubscribeAlert.html(m);
	this.retrieveSubscribeAlert.show();
}

SubscribeEmailValidator.prototype.hideEmailAlert = function()
{
    this.retrieveSubscribeAlert.hide();
}

SubscribeEmailValidator.prototype.showEmailSuccess = function(m)
{
	this.retrieveSubscribeAlert.attr('class', 'alert alert-success');
	this.retrieveSubscribeAlert.html(m);
	this.retrieveSubscribeAlert.fadeIn(500);
}