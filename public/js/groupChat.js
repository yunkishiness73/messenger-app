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
                        let friendsList = displaySearchResults(data['data'], 'create');

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

    $('body').on('click', '.leave-group', function(e) {
        let conversationID =  $('#btn-create-group-chat').attr('data-conversationID');

        errorHandler.checkTokenExisted();
                
        $.ajax({
            type: "POST",
            url: `api/conversations/${conversationID}/leave`,
            headers: {
                'Authorization': `Bearer ${baseService.token}`,
                'Content-Type': 'application/json'
            },
            dataType: "JSON",
            success: function (data, textStatus, xhr) {
                if (xhr.status === 200 || xhr.status === 201) {
                    $('#groupChatModal').modal('toggle');
                    fetchConversations();
                    emitGroupChatCreation(data['data']);
                    $('#screen-chat').hide();
                }
            },
            error: errorHandler.onError
        })

        // swal({
        //     title: "Are you sure to leave this group ?",
        //     icon: "warning",
        //     buttons: true,
        //     dangerMode: true,
        //   })
        //   .then((willLeave) => {
        //     if (willLeave) {

        //         errorHandler.checkTokenExisted();

        //         $.ajax({
        //             type: "PUT",
        //             url: `api/conversations/${conversationID}/leave`,
        //             headers: {
        //                 'Authorization': `Bearer ${baseService.token}`,
        //                 'Content-Type': 'application/json'
        //             },
        //             dataType: "JSON",
        //             success: function (data, textStatus, xhr) {
        //                 alert('thanh cong 1');
        //                 if (xhr.status === 200 || xhr.status === 201) {
        //                     alert('thanh cong');
        //                     $('#groupChatModal').modal('toggle');
        //                     fetchConversations();
        //                 }
        //             },
        //             error: errorHandler.onError
        //         })

        //         members = [];
        
        //         $('#input-name-group-chat').val('')
        //         $('#group-chat-friends').html('');
        //         $("#friends-added").html('');
        //         $("#groupChatModal .list-user-added").hide();

        //         $('#groupChatModal').modal('toggle');
        //     }
        //   });
    })

    $('body').on('click', '.number-members', function(e) {
        e.preventDefault();

        let currentUser = JSON.parse(localStorage.getItem('userInfo'));
        let conversation = JSON.parse($(this).attr('data-conversation'));
        let isAdmin = false;

        if (conversation.admins.indexOf(currentUser._id) != -1) {
            isAdmin = true;
        }

        let friendsList = displaySearchResults(conversation.members, 'update', {
            currentUser,
            isAdmin
        });

        members = conversation.members;

        $("#friends-added").html('');
        $("#friends-added").append(friendsList);
        $("#groupChatModal .list-user-added").show();
        $('#input-name-group-chat').val(conversation.title);

        console.log(conversation);
    });

    $('body').on('click', '.add-user', function(e) {
        console.log('Add user');
        console.log(members);
        let conversationID =  $('#btn-create-group-chat').attr('data-conversationID');
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
            if (conversationID) {

                errorHandler.checkTokenExisted();

                alertify.notify('cbi call api ne', 'success', 7);
                    
                $.ajax({
                    type: "POST",
                    url: `api/conversations/${conversationID}/members`,
                    headers: {
                        'Authorization': `Bearer ${baseService.token}`,
                        'Content-Type': 'application/json'
                    },
                    dataType: "JSON",
                    data: JSON.stringify({
                        members: [
                            member
                        ]
                    }),
                    success: function (data, textStatus, xhr) {
                        if (xhr.status === 200 || xhr.status === 201) {
                            $("#friends-added").append(friend);
                            $("#group-chat-friends").find("div[data-uid=" + uid + "]").remove();

                            fetchConversations();
                            emitGroupChatCreation(data['data']);
                        }
                    },
                    error: errorHandler.onError
                })
            } else {
                members.push(friendObj);
                $("#friends-added").append(friend);
                $(this).remove();
                $("#groupChatModal .list-user-added").show();
                $("#group-chat-friends").find("div[data-uid=" + uid + "]").remove();
    
            }
            console.log('=======+========');
            console.log('Sau khi Add user');
            console.log(members);
        } else {
            alertify.warning('Warning notification message.', 7); 
        }
    });

    $('body').on('click', '.create-group-chat', function(e) {
        $('#btn-create-group-chat').removeAttr('data-conversationID');
    });

    $('body').on('click', '.remove-user', function(e) {
        let conversationID =  $('#btn-create-group-chat').attr('data-conversationID');
        let uid = $(this).data("uid");

        if (conversationID) {
            let member = JSON.parse($(this).attr('data-friend'));
            console.log('-------------REMOVE USER_------------');
            console.log(member);
            console.log(conversationID);

            errorHandler.checkTokenExisted();

            $.ajax({
                url: `api/conversations/${conversationID}/leave`,
                type: 'POST',
                dataType: 'json',
                  headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type':'application/json'
                },
                data: JSON.stringify({
                    members: [
                        member
                    ]
                })
              })
              .done(function(data, textStatus, xhr) {
                if (xhr.status === 200 || xhr.status === 201) {
                    alertify.notify('Remove succcessfully', 'success', 7);
                    $("#friends-added").find("div[data-uid=" + uid + "]").remove();
                    emitGroupChatCreation(data['data']);
                    members = members.filter(member => {
                        return member._id !== uid;
                    });

                       
                    console.log('after remove: ');
                    console.log(members);
                 }
              })
              .fail(errorHandler.onError)
        } else {
            $("#friends-added").find("div[data-uid=" + uid + "]").remove();

            members = members.filter(member => {
                return member._id !== uid;
            });

            console.log('after remove: ');
                    console.log(members);
        }

     
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
                if (xhr.status === 200 || xhr.status === 201) {
                    $('#groupChatModal').modal('toggle');

                    emitGroupChatCreation(data['data']);
                }
            },
            error: errorHandler.onError
        })
    });

    $('body').on('click', '#btn-cancel-group-chat', function(e) {
        swal({
            title: "Are you sure to cancel group creation ?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willCancel) => {
            if (willCancel) {
                members = [];
        
                $('#input-name-group-chat').val('')
                $('#group-chat-friends').html('');
                $("#friends-added").html('');
                $("#groupChatModal .list-user-added").hide();

                $('#groupChatModal').modal('toggle');
            }
          });

        
    });
}


function displaySearchResults(friends, actionType='create', options) {
    errorHandler.checkTokenExisted();
    
    let friendsList = '';

    friends.forEach(friend => {
        if (actionType == 'update') {
            let { currentUser, isAdmin } = options;

            if (isAdmin) {
                if (currentUser._id === friend._id) {
                    friendsList += Friend(friend, 'leave&remove');
                } else {
                    friendsList += Friend(friend, 'remove');
                }
            } else {
                if (currentUser._id === friend._id) {
                    friendsList += Friend(friend, 'leave');
                } else {
                    friendsList += Friend(friend, 'noAction');
                }
            }      
        } else {
            friendsList += Friend(friend.friendID);
        }
    });

    return friendsList;
}

function Friend(friend, btnType='create') {
    let photo;
    let btn = '';

    console.log(friend)
    console.log(friend)

    if (friend.photo) {
        photo = `${BASE_URL}/${friend.photo}`.replace('uploads', '');
    } else {
        photo = 'https://img.icons8.com/material/4ac144/256/user-male.png';
    }

    if (btnType == 'create') {
        btn = `<div data-friend='${JSON.stringify(friend)}' class="add-user" data-uid="${friend._id}">
            Thêm vào nhóm
        </div>`;
    } else if (btnType == 'remove') {
        btn = `<div data-friend='${JSON.stringify(friend)}' class="remove-user" data-uid="${friend._id}">
            Xóa khỏi nhóm
        </div>`
    } else if (btnType == 'leave') {
        btn = `<div data-friend='${JSON.stringify(friend)}' class="leave-group" data-uid="${friend._id}">
                Rời khỏi nhóm
            </div>`
    } else if (btnType == 'leave&remove') {
        btn = `<div data-friend='${JSON.stringify(friend)}' class="remove-user" data-uid="${friend._id}">
                Xóa khỏi nhóm
                </div>`;
        btn += '&nbsp';
        btn += `<div data-friend='${JSON.stringify(friend)}' class="leave-group" data-uid="${friend._id}">
                    Rời khỏi nhóm
                </div>
                `;
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
                    ${ btn }
                </div>
            </li>
        </div>
    `;
}

$(function() {
    searchFriends();

    createGroupChat();
})