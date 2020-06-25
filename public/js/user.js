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
            <div class="user-talk" data-uid="${friend._id}">
                Trò chuyện
            </div>
            <div class="user-remove-contact action-danger" data-uid="${friend._id}">
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

    if (friend.receiverID.photo) {
        photo = `${BASE_URL}/${friend.receiverID.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    return `<li class="_contactList" data-uid="${friend.receiverID._id}">
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
                    <div class="user-approve-request-contact-received" data-friend-request="${friend._id}" data-uid="${friend.receiverID._id}">
                        Chấp nhận
                    </div>
                    <div class="reject-friend-requests user-remove-request-contact-received action-danger" data-friend-request="${friend._id}" data-uid="${friend.receiverID._id}">
                        Từ chối
                    </div>
                </div>
            </li>`
}

function acceptFriendRequest() {
    $('body').on('click', '.user-approve-request-contact-received', function(e) {
        e.preventDefault();

        let _friendRequestID = $(this).attr('data-friend-request');

        console.log('aceept')
        console.log(_friendRequestID)

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

        console.log('REJECT')
        console.log(_friendRequestID)
    
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
                        console.log(data['data']);
                      
                        let senderID = data['data']['senderID'];
                        let receiverID = data['data']['receiverID'];
                        
                        let users = [ senderID, receiverID ];

                        console.log("=============");
                        
                        console.log(users);

                        emitAcceptFriendRequest(users);
                    }
                },
                error: errorHandler.onError
            })
        }
    })
}

$(function () {
    showUserInfo();

    fetchFriendsList();

    fetchFriendsRequest();

    fetchImcommingRequest();

    acceptFriendRequest();

    rejectFriendRequest();
});