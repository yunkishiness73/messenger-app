function searchFriends() {
    $("#input-search-friend-to-add-group-chat").keypress(function(e) {
        if (e.keyCode === 13) {
            let keyword = $.trim($(this).val());

            if (!keyword) {
                return false;
            }

            errorHandler.checkTokenExisted();

            $.ajax({
                type: "GET",
                url: `api/search?q=${keyword}&searchType=friends`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                dataType: "JSON",
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200) {
                        let friendsList = displaySearchResults(data['data']);

                        $('#group-chat-friends').html('');
                        $('#group-chat-friends').append(friendsList);
                    }
                },
                error: errorHandler.onError
            })
        }
    })
}

function createGroupChat() {
    let members = [];

    $('body').on('click', '.add-user', function(e) {
        console.log(members);
        let uid = $(this).data("uid");

        let friendObj = JSON.parse($(this).attr('data-friend'));
        let friend = Friend(friendObj, 'remove');

        let flag = true;

        members.forEach(member => {
            console.log(member._id, friendObj._id);
            if (member._id == friendObj._id) {
                flag = false;
            }
        });

        if (flag) {
            members.push(friendObj);
            $("#friends-added").append(friend);
            $(this).remove();
            $("#groupChatModal .list-user-added").show();
            $("#group-chat-friends").find("div[data-uid=" + uid + "]").remove();
        }
    });

    $('body').on('click', '.remove-user', function(e) {
        let uid = $(this).data("uid");

        $("#friends-added").find("div[data-uid=" + uid + "]").remove();

        members = members.filter(member => {
            return member._id !== uid;
        });
    });

    $('body').on('click', '#btn-create-group-chat', function(e) {
        let title = $.trim($('#input-name-group-chat').val());

        if (!title) {
            alertify.notify('Please input conversation name', 'error', 7);
            return false;
        }

        if (members.length < 2 ) {
            alertify.notify('Group must have at least 2 members', 'error', 7);
            return false;
        }

        errorHandler.checkTokenExisted();

        $.ajax({
            type: "POST",
            url: `api/conversations`,
            headers: {
                'Authorization': `Bearer ${baseService.token}`,
                'Content-Type': 'application/json'
            },
            dataType: "JSON",
            data: JSON.stringify({
                type: 'Group',
                members,
                title
            }),
            success: function (data, textStatus, xhr) {
                if (xhr.status === 200) {
                   
                    console.log(data);
                }
            },
            error: errorHandler.onError
        })
    });

    $('body').on('click', '#btn-cancel-group-chat', function(e) {

    });
}


function displaySearchResults(friends) {
    let friendsList = '';

    friends.forEach(friend => {
        friendsList += Friend(friend.friendID);
    });

    return friendsList;
}

function Friend(friend, actionType='create') {
    let photo;
    let action;

    if (friend.photo) {
        photo = `${BASE_URL}/${friend.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    if (actionType == 'create') {
        action = `<div data-friend='${JSON.stringify(friend)}' class="add-user" data-uid="${friend._id}">
            Thêm vào nhóm
        </div>`;
    } else if (actionType == 'remove') {
        action = `<div data-friend='${JSON.stringify(friend)}' class="remove-user" data-uid="${friend._id}">
            Xóa khỏi nhóm
        </div>`
    }

    return `
        <div data-uid="${friend._id}">
            <li data-uid="${friend._id}">
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
                        <span>&nbsp; ${friend.displayName}</span>
                    </div>
                    ${ action }
                </div>
            </li>
        </div>
    `;
}

$(function() {
    searchFriends();

    createGroupChat();

})