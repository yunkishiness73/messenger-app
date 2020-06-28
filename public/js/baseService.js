const errorHandler = {
	onError: function(xhr, statusText, err){
        if (xhr.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');

        	window.open("http://localhost:1337/signin", "_self");
        } else {
            if (xhr.responseJSON.error.message) {
                alertify.notify(`${xhr.responseJSON.error.message}`, 'error', 7);
            } else {
                alertify.notify(`${error}`, 'error', 7);
            }
        }
    },
    checkTokenExisted: function() {
        let token = JSON.parse(localStorage.getItem("token"));
    	
    	if (!token) {
            window.open("http://localhost:1337/signin", "_self");
    	}
    	
    	baseService.token = token;
    }
}

const baseService = {
	token: '',
}