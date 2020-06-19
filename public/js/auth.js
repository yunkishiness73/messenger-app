let API_URL = 'http://localhost:1337/api/auth';

function showRegisterForm() {
    $('.loginBox').fadeOut('fast', function () {
        $('.registerBox').fadeIn('fast');
        $('.login-footer').fadeOut('fast', function () {
            $('.register-footer').fadeIn('fast');
        });
        $('.modal-title').html('Đăng ký tài khoản');
    });
    $('.error').removeClass('alert alert-danger').html('');

}

function showLoginForm() {
    $('#loginModal .registerBox').fadeOut('fast', function () {
        $('.loginBox').fadeIn('fast');
        $('.register-footer').fadeOut('fast', function () {
            $('.login-footer').fadeIn('fast');
        });

        $('.modal-title').html('Đăng nhập');
    });
    $('.error').removeClass('alert alert-danger').html('');
}

function openLoginModal() {
    setTimeout(function () {
        $('#loginModal').modal('show');
        showLoginForm();
    }, 230);
}

function openRegisterModal() {
    setTimeout(function () {
        $('#loginModal').modal('show');
        showRegisterForm();
    }, 230);
}

function auth() {
    $('.btn-login').on('click', function(e) {
        e.preventDefault();

        let username = $('.email').val();
        let password = $('.password').val();

        $.ajax({
            type: "POST",
            url: `${API_URL}`,
            data: {
                username,
                password
            },
            dataType: "JSON",
            success: function(data, textStatus, xhr) {
                if (xhr.status === 200) {
                    localStorage.setItem('token', JSON.stringify(data.token));
                    localStorage.setItem('userInfo', JSON.stringify(data.userInfo));

                    window.open("http://localhost:1337/home", "_self");
                }
            },
            error: function(xhr, statusText, err){
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');

                    window.open("http://localhost:1337/signin", "_self");
                }
            }
        })
      
    });
}

$(function () {
    auth();
});