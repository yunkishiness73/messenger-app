const errorHandler = {
	onError: function(xhr, statusText, err){
        if (xhr.status === 401) {
            console.log('here');
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');

        	window.open("http://localhost:1337/signin", "_self");
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