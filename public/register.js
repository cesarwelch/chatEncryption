function register(argument) {
	console.log(argument);
	var payload = {
		username:document.getElementById("username").value,
		password:document.getElementById("password").value
	};
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:8080/register",
        "method": "POST",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        "data": {
            "username": payload.username,
            "password": payload.password
        }
    }
    $.ajax(settings).done(function(response) {
        console.log(response);
    });
}