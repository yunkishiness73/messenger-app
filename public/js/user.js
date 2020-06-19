function showUserInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    let photo = `${BASE_URL}/${userInfo.photo}`.replace('uploads', '') || '';

    $('#navbar-displayName').html(userInfo.displayName);
    $('#navbar-photo').attr("src", photo);
}

$(function () {
    showUserInfo();
});