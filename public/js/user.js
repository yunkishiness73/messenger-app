function showUserInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    let photo = `${BASE_URL}/${userInfo.photo}`.replace('uploads', '') || '';

    $('#navbar-displayName').html(userInfo.displayName);
    $('#navbar-photo').attr("src", photo);

    let conversationIDs = [userInfo._id];

    sendConversationsList(conversationIDs);
}

function renderFriendItem(friends) {
    let friendsList = '';

    friends.forEach(friend => {
        friendsList += FriendItem(friend.friendID);
    })

    return friendsList;
}

function FriendItem(friend) {
    let photo = '';

    if (friend.photo) {
        photo = `${BASE_URL}/${friend.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    return `
    <li class="_contactList" data-uid="${friend._id}">
        <div class="contactPanel">
            <div class="user-avatar">
                <img src="${photo}" alt="">
            </div>
            <div class="user-name">
                <p>
                    ${friend.username}
                </p>
            </div>
            <br>
            <div class="user-address">
                <span>&nbsp ${friend.displayName}</span>
            </div>
            <div class="user-talk" data-friend='${JSON.stringify(friend)}' data-uid="${friend._id}">
                Trò chuyện
            </div>
            <div class="user-remove-contact action-danger" data-friend='${JSON.stringify(friend)}' data-uid="${friend._id}">
                Xóa liên hệ
            </div>
        </div>
    </li>`;
}

function fetchFriendsList() {
    errorHandler.checkTokenExisted();

    $.ajax({
        type: "GET",
        url: `api/friends`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type': 'application/json'
        },
        dataType: "JSON",
        success: function (data, textStatus, xhr) {
            if (xhr.status === 200 || xhr.status === 201) {
                let friendsList = renderFriendItem(data['data']);

                let contactsList = $('#contacts>.find-user-bottom>.contactList');

                contactsList.html('');
                contactsList.append(friendsList);

                let count_contacts = ``;

                if (Array.isArray(data['data']) && data['data'].length > 0) {
                    count_contacts = `
                                        <span class="show-number-contacts count-contacts">
                                            (<em>${data['data'].length}</em>)
                                        </span>`;
                } else {
                    count_contacts = `<span class="show-number-contacts count-contacts"></span>`;
                }

                $('.count-contacts').remove();
                $('#link-contacts').append(count_contacts);
            }
        },
        error: errorHandler.onError
    })
}

function fetchFriendsRequest() {
    errorHandler.checkTokenExisted();
    
    $.ajax({
        type: "GET",
        url: `api/friends/requests`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type': 'application/json'
        },
        dataType: "JSON",
        success: function (data, textStatus, xhr) {
            if (xhr.status === 200 || xhr.status === 201) {
                let friendsList = renderFriendRequest(data['data']);

                let contactsList = $('#request-contact-sent>.find-user-bottom>.contactList');

                contactsList.html('');
                contactsList.append(friendsList);

                let count_contacts = ``;

                if (Array.isArray(data['data']) && data['data'].length > 0) {
                    count_contacts = `
                                        <span class="show-number-contacts count-request-contact-sent">
                                            (<em>${data['data'].length}</em>)
                                        </span>`;
                } else {
                    count_contacts = `<span class="show-number-contacts count-request-contact-sent"></span>`;
                }

                $('.count-request-contact-sent').remove();
                $('#link-request-contact-sent').append(count_contacts);
            }
        },
        error: errorHandler.onError
    })
}


function renderFriendRequest(friends) {
    let friendsList = '';

    friends.forEach(friend => {
        friendsList += FriendRequest(friend);
    })

    return friendsList;
}

function FriendRequest(friend) {
    let photo = '';

    if (friend.receiverID.photo) {
        photo = `${BASE_URL}/${friend.receiverID.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    return `
            <li class="_contactList" data-uid="${friend.receiverID._id}">
                <div class="contactPanel">
                    <div class="user-avatar">
                        <img src="${photo}" alt="">
                    </div>
                    <div class="user-name">
                        <p>
                            ${friend.receiverID.username}
                        </p>
                    </div>
                    <br>
                    <div class="user-address">
                        <span>&nbsp ${friend.receiverID.displayName}</span>
                    </div>
                    <div class="reject-friend-requests user-remove-request-contact-sent action-danger display-important" data-friend-request="${friend._id}" data-uid="${friend.receiverID._id}">
                        Hủy yêu cầu
                    </div>
                </div>
            </li>`;
}

function fetchImcommingRequest() {
    errorHandler.checkTokenExisted();
    
    $.ajax({
        type: "GET",
        url: `api/friends/requests/incomming`,
        headers: {
            'Authorization': `Bearer ${baseService.token}`,
            'Content-Type': 'application/json'
        },
        dataType: "JSON",
        success: function (data, textStatus, xhr) {
            if (xhr.status === 200 || xhr.status === 201) {
                let friendsList = renderIncommingFriendRequest(data['data']);

                let contactsList = $('#request-contact-received>.find-user-bottom>.contactList');

                contactsList.html('');
                contactsList.append(friendsList);

                let count_contacts = ``;

                if (Array.isArray(data['data']) && data['data'].length > 0) {
                    count_contacts = `
                                        <span class="show-number-contacts count-request-contact-received">
                                            (<em>${data['data'].length}</em>)
                                        </span>`;
                } else {
                    count_contacts = `<span class="show-number-contacts count-request-contact-received"></span>`;
                }

                $('.count-request-contact-received').remove();
                $('#link-request-contact-received').append(count_contacts);
            }
        },
        error: errorHandler.onError
    })
}

function renderIncommingFriendRequest(friends) {
    let friendsList = '';

    friends.forEach(friend => {
        friendsList += IncommingFriendRequest(friend);
    })

    return friendsList;
}

function IncommingFriendRequest(friend) {
    let photo = '';

    if (friend.senderID.photo) {
        photo = `${BASE_URL}/${friend.senderID.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    return `<li class="_contactList" data-uid="${friend.senderID._id}">
                <div class="contactPanel">
                    <div class="user-avatar">
                        <img src="${photo}" alt="">
                    </div>
                    <div class="user-name">
                        <p>
                            ${friend.senderID.username}
                        </p>
                    </div>
                    <br>
                    <div class="user-address">
                        <span>&nbsp ${friend.senderID.displayName}</span>
                    </div>
                    <div class="user-approve-request-contact-received" data-friend-request="${friend._id}" data-uid="${friend.senderID._id}">
                        Chấp nhận
                    </div>
                    <div class="reject-friend-requests user-remove-request-contact-received action-danger" data-friend-request="${friend._id}" data-uid="${friend.senderID._id}">
                        Từ chối
                    </div>
                </div>
            </li>`
}

function acceptFriendRequest() {
    $('body').on('click', '.user-approve-request-contact-received', function(e) {
        e.preventDefault();

        let _friendRequestID = $(this).attr('data-friend-request');

        if (_friendRequestID) {
            errorHandler.checkTokenExisted();
        
            $.ajax({
                type: "POST",
                url: `api/friends/requests/accept`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                dataType: "JSON",
                data: JSON.stringify({
                    friendRequestID: _friendRequestID
                }),
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        if (Array.isArray(data['data']) && data['data'].length > 0) {
                            let userID = data['data'][0]['userID'];
                            let friendID = data['data'][0]['friendID'];
                            
                            let users = [ userID, friendID ];

                            emitAcceptFriendRequest(users)
                        }
                    }
                },
                error: errorHandler.onError
            }) 
        }
    })
}

function rejectFriendRequest() {
    $('body').on('click', '.reject-friend-requests', function(e) {
        e.preventDefault();
        
        let _friendRequestID = $(this).attr('data-friend-request');
    
        if (_friendRequestID) {
            errorHandler.checkTokenExisted();

            $.ajax({
                type: "POST",
                url: `api/friends/requests/reject`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                dataType: "JSON",
                data: JSON.stringify({
                    friendRequestID: _friendRequestID
                }),
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        let senderID = data['data']['senderID'];
                        let receiverID = data['data']['receiverID'];
                        
                        let users = [ senderID, receiverID ];

                        emitAcceptFriendRequest(users);
                    }
                },
                error: errorHandler.onError
            })
        }
    })
}

function renderSearchResults(users) {
    let userList = '';

    users.forEach(user => {
        userList += User(user);
    })

    return userList;
}

function User(user) {
    let photo = '';

    if (user.photo) {
        photo = `${BASE_URL}/${user.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    return `<li class="_contactList" data-uid="${user._id}">
                <div class="contactPanel">
                    <div class="user-avatar">
                        <img src="${photo}" alt="">
                    </div>
                    <div class="user-name">
                        <p>
                            ${user.username}
                        </p>
                    </div>
                    <br>
                    <div class="user-address">
                        <span>&nbsp ${user.displayName}</span>
                    </div>
                    <div class="send-friend-requests" data-user='${JSON.stringify(user)}' data-uid="${user._id}">
                       Kết bạn
                    </div>
                </div>
            </li>`
}

function searchUsers() {
    $('#input_find-users-contact').keyup(function (e) { 
        if (e.keyCode === 13) {
            let keyword = $.trim($(this).val());

            if (!keyword) {
                alertify.notify('Please input keyword. Ex: \'Kiet\'','e')
                return false;
            } 

            $.ajax({
                type: "GET",
                url: `api/users?q=${keyword}`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                dataType: "JSON",
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        let usersList = renderSearchResults(data['data']);

                        $('.usersList').html('');
                        $('.usersList').append(usersList);
                    }
                },
                error: errorHandler.onError
            })
        }
    });
}

function sendFriendRequests() {
    $('body').on('click', '.send-friend-requests', function(e) {
        e.preventDefault();

        let _user = JSON.parse($(this).attr('data-user'));
        let _receiverID = $(this).data('uid');

        if (_receiverID) {
            errorHandler.checkTokenExisted();

            $.ajax({
                type: "POST",
                url: `api/friends/requests`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                dataType: "JSON",
                data: JSON.stringify({
                    receiverID: _receiverID
                }),
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        $('.usersList').find("li[data-uid=" + _receiverID + "]").remove();

                        let receiverID = data['data']['receiverID'];
                        let senderID = data['data']['senderID'];

                        // let friendRequest =  _FriendRequest({ ...data['data'], ..._user });
                        // let contactsStr = $('.count-request-contact-sent > em').html('');
                        // let contactsNum =  contactsStr ? 0 : parseInt(contactsStr);

                        // let count_contacts = `
                        //                     <span class="show-number-contacts count-request-contact-sent">
                        //                         (<em>${(++contactsNum)}</em>)
                        //                     </span>`;
                        
                        // $('.count-request-contact-sent').remove();
                        // $('#link-request-contact-sent').append(count_contacts);

                        // $('#request-contact-sent>.find-user-bottom>.contactList').append(friendRequest);

                        emitAcceptFriendRequest([ receiverID , senderID ]);
                    }
                },
                error: errorHandler.onError
            })
        }
    })
}

function _FriendRequest(friend) {
    let photo = '';

    if (friend.photo) {
        photo = `${BASE_URL}/${friend.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    return `
            <li class="_contactList" data-uid="${friend._id}">
                <div class="contactPanel">
                    <div class="user-avatar">
                        <img src="${photo}" alt="">
                    </div>
                    <div class="user-name">
                        <p>
                            ${friend.username}
                        </p>
                    </div>
                    <br>
                    <div class="user-address">
                        <span>&nbsp ${friend.displayName}</span>
                    </div>
                    <div class="reject-friend-requests user-remove-request-contact-sent action-danger display-important" data-friend-request="${friend._id}" data-uid="${friend.receiverID}">
                        Hủy yêu cầu
                    </div>
                </div>
            </li>`;
}

function talk() {
    $('body').on('click', '.user-talk', function(e) {
        e.preventDefault();

        let currentUser = JSON.parse(localStorage.getItem('userInfo'));
        let receiverID = $(this).data('uid');
        let friend =  JSON.parse($(this).attr('data-friend'));
        
        if (currentUser._id && receiverID) {
            errorHandler.checkTokenExisted();

            $.ajax({
                type: "GET",
                url: `api/conversations?m=${currentUser._id + ',' + receiverID}`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                dataType: "JSON",
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        $('#screen-chat').show();
                        $("#contactsModal").modal('toggle');
                
                        if (data['data'].length) {
                            let conversation = data['data'][0];

                            conversation['to'] = friend; 
                            conversation['conversationName'] = friend['displayName'];

                            beforeFetchConversationMessage(conversation);
                        } else {
                            $('.conversation-name').html(friend['displayName']);
                            $('.show-member-tab').hide();

                            $("[data-chat]").attr("data-chat", '');
                            $('.conversation-name').html(friend['displayName']);
                            $('.conversation-name').attr('data-receiverID', receiverID);
                         
                            $('.pageIndex').attr('data-hasMessage', 1);
                            $('.pageIndex').attr('data-currentPage', 1);
                            $('.pageIndex').hide();

                            $('.chat').html('');
                            $('.all-images').html('');
                            $('.list-attachments').html('');

                            configAttachmentsModal();
                        }   
                    }
                },
                error: errorHandler.onError
            })
        }
    })
}

let imgFile;
let updateEntity = {};

function fetchUserInfo() {
    $('body').on('click', '.user-profile', function(e) {
        let currentUser = JSON.parse(localStorage.getItem('userInfo'));


        let _photo = currentUser.photo ? currentUser.photo.replace('uploads', '') : '';
    
        
        $('.avatar').attr('src', _photo);
        $('#input-change-username').val(currentUser.username);
        $('#input-change-firstName').val(currentUser.firstName);
        $('#input-change-lastName').val(currentUser.lastName);
        $('#input-btn-update-user').data('userID', currentUser._id);
        
        $('#input-change-current-password').val('');
        $('#input-change-new-password').val('');
        $('#input-change-confirm-new-password').val('');
    });
}

function editUserInfo() {
    $('#input-change-avatar').on('change', function() {

        let maxSize = 10*1000*1000;
        let file = $(this).prop('files')[0];

        if (!file) {
            alertify.notify('Please upload image', 'error', 7);
            return false;
        }

        if (file.size > maxSize) {
            alertify.notify('File must less than 10MB', 'error', 7);
            return false;
        }
    
        if (!file.type.match(/image/)) {
            alertify.notify('Please upload image', 'error', 7);
            return false;
        }

        const reader = new FileReader();
    
        reader.onload = function(e) {
            $('.avatar').attr('src', e.target.result);
            
        }
    
        reader.readAsDataURL(file); // convert to base64 string

        imgFile = file;
    });

    $('body').on('click', '#input-btn-update-user', function(e) {
        e.preventDefault();

        let firstName = $.trim($('#input-change-firstName').val());
        let lastName = $.trim($('#input-change-lastName').val());
        let userID = $(this).data('userID');

        if (!firstName) {
            alertify.notify('Please input your first name', 'error', 10);
            
            return false;
        }

        if (!lastName) {
            alertify.notify('Please input your last name', 'error', 10);
            
            return false;
        }

        if (imgFile) {
            let fd = new FormData();

            fd.append('photo', imgFile);
            fd.append('firstName', firstName);
            fd.append('lastName', lastName);
            fd.append('displayName', `${firstName} ${lastName}`);

            errorHandler.checkTokenExisted();

            $.ajax({
                url: `/api/users/${userID}`,
                method: 'PUT',
                data: fd,
                processData: false,
                contentType: false,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`
                },
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        localStorage.setItem('userInfo', JSON.stringify(data['data']))
                        showUserInfo();
                        alertify.notify('Update information successfully', 'success', 7);
                    }
                },
                error: function (xhr, errorMessage) {
                    removeUploadedFile();

                    alert(errorMessage);
                }
            });
        } else {
            $.ajax({
                url: `/api/users/${userID}`,
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${baseService.token}`
                },
                dataType: "JSON",
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    displayName: `${firstName} ${lastName}`
                },
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                        localStorage.setItem('userInfo', JSON.stringify(data['data']))
                        showUserInfo();
                        alertify.notify('Update information successfully', 'success', 7);
                    }
                },
                error: errorHandler.onError
            });
        }
    })
}

function changePassword() {
    $('body').on('click', '#input-btn-update-user-password', function(e) {
        e.preventDefault();

        const checkSpacePattern = /\s/gmi;

        let currentUser = JSON.parse(localStorage.getItem('userInfo'));

        let password = $.trim($('#input-change-current-password').val());
        let newPassword = $.trim($('#input-change-new-password').val());
        let confPassword = $.trim($('#input-change-confirm-new-password').val());

        if (!password) {
            alertify.notify('Please input your current password', 'error', 10);
            
            return false;
        }

        if (!newPassword) {
            alertify.notify('Please input your new password', 'error', 10);
            
            return false;
        }

        if (!confPassword) {
            alertify.notify('Please input your confirm new password', 'error', 10);
            
            return false;
        }

        if (checkSpacePattern.test(newPassword)) {
            alertify.notify('New password must not contain space', 'error', 10);
            
            return false;
        }

        if (checkSpacePattern.test(confPassword)) {
            alertify.notify('Confirmation password must not contain space', 'error', 10);
            
            return false;
        }

        if (password === newPassword) {
            alertify.notify('The new password must be different from the old password', 'error', 10);
            
            return false;
        }

        if (newPassword !== confPassword) {
            alertify.notify('Password and confirmation password does not match', 'error', 10);
            
            return false;
        }

        swal({
            title: "Are you sure to change password ?",
            icon: "info",
            buttons: true,
            dangerMode: true,
          })
          .then((willChange) => {
            if (willChange) {
                errorHandler.checkTokenExisted();

                $.ajax({
                    url: `/api/users/${currentUser._id}`,
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${baseService.token}`
                    },
                    dataType: "JSON",
                    data: {
                      password,
                      newPassword
                    },
                    success: function (data, textStatus, xhr) {
                        if (xhr.status === 200 || xhr.status === 201) {
                            $('#user-profile-modal').modal('toggle');
                            
                            swal("Password changed!", "Auto signout after 5s", "info");
                            setTimeout(() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userInfo');
                    
                                window.open("http://localhost:1337/signin", "_self");
                            }, 5000);
        
                        }
                    },
                    error: errorHandler.onError
                });
            }
          });
    })
}

$(function () {
    showUserInfo();

    fetchFriendsList();

    fetchFriendsRequest();

    fetchImcommingRequest();

    acceptFriendRequest();

    rejectFriendRequest();
    
    searchUsers();

    sendFriendRequests();

    talk();

    fetchUserInfo();

    editUserInfo();

    changePassword();
});