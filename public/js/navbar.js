function logOut() {
    $('.btn-logout').click(function (e) { 
        e.preventDefault();
        
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');

        window.open("http://localhost:1337/signin", "_self");
    });
}    

$(function() {
   logOut();
});