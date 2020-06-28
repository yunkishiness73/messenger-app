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

function forgotPassword() {
    $('body').on('click', '#forgot-password', function (e) {
        e.preventDefault();

        let username = $.trim($('.email').val());

        if (!username) {
            alertify.notify('Please input your email to get new password', 'error', 10);
            return false;
        }

        swal({
            title: "Are you sure?",
            text: `Your new password will be sent to ${username}`,
            icon: "warning",
            buttons: true,
        })
            .then((confirm) => {
                if (confirm) {
                    $.ajax({
                        type: "POST",
                        url: `api/users/forgotPassword`,
                        data: {
                            username
                        },
                        dataType: "JSON",
                        success: function (data, textStatus, xhr) {
                            if (xhr.status === 200 || xhr.status === 201) {
                                alertify.notify(`Check email ${username} to get new password`, 'success', 10);
                            }
                        },
                        error: function (xhr, statusText, err) {
                            alertify.notify(`Can not send new password to email ${username}`, 'error', 10);
                        }
                    })
                }
            });
    })
}

function register() {
    $('.btn-register').click(function (e) {
        e.preventDefault();

        let email = $('#email').val();
        let firstName = $('#firstName').val();
        let lastName = $('#lastName').val();
        let password = $('#password').val();
        let confPassword = $('#password_confirmation').val();

        const isValid = isAccountValid({
            email, firstName, lastName, password, confPassword
        });

        if (isValid) {
            $.ajax({
                type: "POST",
                url: `api/users`,
                data: {
                    username: email,
                    password,
                    firstName,
                    lastName,
                    displayName: firstName + ' ' + lastName
                },
                dataType: "JSON",
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        $('#email').val('');
                        $('#firstName').val('');
                        $('#lastName').val('');
                        $('#password').val('');
                        $('#password_confirmation').val('');

                        swal("Activate Account!", `Check email ${email} to activate account`, "info");
                    }
                },
                error: function (xhr, statusText, err) {
                    if (xhr.responseJSON.error.message) {
                        alertify.notify(`${xhr.responseJSON.error.message}`, 'error', 10);
                    } else {
                        alertify.notify(`${error}`, 'error', 10);
                    }
                }
            })
        }

    })
}

const isAccountValid = (payload) => {
    const emailPattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/

    const { firstName, lastName, password, confPassword, email } = payload;

    let formIsValid = true;

    $(".password-helper").html('');
    $(".confPassword-helper").html('');
    $(".displayName-helper").html('');
    $(".email-helper").html('');
    $(".lastName-helper").html('');
    $(".firstName-helper").html('');

    if (password.trim().length == 0) {
        $(".password-helper").html('Password is required');
        formIsValid = false;
    }

    if (confPassword.trim().length == 0) {
        $(".confPassword-helper").html('Password is required');
        formIsValid = false;
    } else {
        if (password.trim() !== confPassword.trim()) {
            $(".confPassword-helper").html('Password does not match');
            formIsValid = false;
        }
    }

    if (firstName.trim().length == 0) {
        $(".firstName-helper").html('First name is required');
        formIsValid = false;
    }

    if (lastName.trim().length == 0) {
        $(".lastName-helper").html('Last name is required');
        formIsValid = false;
    }

    if (email.trim().length == 0) {
        $(".email-helper").html('Email is required');
        formIsValid = false;
    } else {
        if (!emailPattern.test(email.trim())) {
            $(".email-helper").html('Email is not valid');
            formIsValid = false;
        }
    }

    return formIsValid;
}

function auth() {
    $('.btn-login').on('click', function (e) {
        e.preventDefault();

        let username = $.trim($('.email').val());
        let password = $.trim($('.password').val());

        if (!username) {
            alertify.notify('Please input email', 'error', 10);
            return false;
        }

        if (!password) {
            alertify.notify('Please input password', 'error', 10);
            return false;
        }

        $.ajax({
            type: "POST",
            url: `${API_URL}`,
            data: {
                username,
                password
            },
            dataType: "JSON",
            success: function (data, textStatus, xhr) {
                if (xhr.status === 200) {
                    $('.error').html('');

                    localStorage.setItem('token', JSON.stringify(data.token));
                    localStorage.setItem('userInfo', JSON.stringify(data.userInfo));

                    window.open("http://localhost:1337/home", "_self");
                }
            },
            error: function (xhr, statusText, err) {
                if (xhr.status === 401) {
                    alertify.notify('Email or password is wrong. Please check again', 'error', 10);
                }
            }
        })

    });
}

$(function () {
    auth();

    forgotPassword();

    register();
});