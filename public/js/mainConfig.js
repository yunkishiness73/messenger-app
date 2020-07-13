const socket = io('http://localhost:1337');


function nineScrollLeft() {
  $('.left').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function nineScrollRight() {
  $(`.right .chat`).niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function enableEmojioneArea(divId) {
  $(`#write-chat`).emojioneArea({
    standalone: false,
    pickerPosition: 'top',
    filtersPosition: 'top',
    tones: false,
    autocomplete: false,
    inline: true,
    hidePickerOnBlur: true,
    search: false,
    shortnames: false,
    events: {
      keyup: function(editor, e) {
        //Gán giá trị thay đổi vào thẻ input đã bị ẩn
        $(`#write-chat`).val(this.getText());
      
        //If button Enter is press then send message to server
        if (e.keyCode == 13) {
          errorHandler.checkTokenExisted();
        
          let conversationID = $('#write-chat').attr('data-chat');
          let message = $.trim($('#write-chat').val());
         
          if (!message) {
            return false;
          }

          if (conversationID) {
            $.ajax({
                type: "POST",
                url: `api/messages/send`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                data:  JSON.stringify({
                    conversationID: conversationID,
                    messageType: 'Text',
                    message: message
                }),
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                    //Reload conversation to get newest message
                      // fetchConversations();
                      
                      $('.emojionearea-editor').html('');
                      // appendToMessageList(data['data']);

                      emitNewPrivateMessage(data['data']);
                    }
                },
                error: errorHandler.onError
            })
          } else {              
              let receiverID = $('.conversation-name').attr('data-receiverID');
              let currentUser = JSON.parse(localStorage.getItem('userInfo'));

              $.ajax({
                type: "POST",
                url: `api/messages/send`,
                headers: {
                    'Authorization': `Bearer ${baseService.token}`,
                    'Content-Type': 'application/json'
                },
                data:  JSON.stringify({
                    receiverID: receiverID,
                    message: message,
                    conversationType: 'Single'
                }),
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    if (xhr.status === 200 || xhr.status === 201) {
                      $('.emojionearea-editor').html('');
                      $("[data-chat]").attr("data-chat", data['data'].conversation);

                      emitNewPrivateMessage(data['data'], [receiverID, currentUser._id]);
                    }
                },
                error: errorHandler.onError
            })
          }
        }
      },
      click: function() {

      },
      focus: function(editor, e) {
        let conversationID = $('#write-chat').attr('data-chat');
        let currentUser = JSON.parse(localStorage.getItem('userInfo'));

        if (conversationID) {
          markSeen(conversationID);

          emitTypingEvent({
            conversationID,
            userTyping: currentUser
          });
        }


      },
      blur: function () {
        let conversationID = $('#write-chat').attr('data-chat');
        let currentUser = JSON.parse(localStorage.getItem('userInfo'));

        if (conversationID) {
          emitStopTypingEvent({
            conversationID,
            userTyping: currentUser
          })
        }
      },
    },
  });
  $('body').on('click', '.icon-chat', function(event) {
    event.preventDefault();
    $('.emojionearea-button').click();
    $('.emojionearea-editor').focus();
  });
}

function spinLoaded() {
  $('.master-loader').css('display', 'none');
}

function spinLoading() {
  $('.master-loader').css('display', 'block');
}

function ajaxLoading() {
  $(document)
    .ajaxStart(function() {
      spinLoading();
    })
    .ajaxStop(function() {
      spinLoaded();
    });
}

function showModalContacts() {
  $('#show-modal-contacts').click(function() {
    $(this).find('.noti_contact_counter').fadeOut('slow');
  });
}

function configNotification() {
  $('#noti_Button').click(function() {
    $('#notifications').fadeToggle('fast', 'linear');
    $('.noti_counter').fadeOut('slow');
    return false;
  });
  $(".main-content").click(function() {
    $('#notifications').fadeOut('fast', 'linear');
  });
}

function gridPhotos(layoutNumber) {
  $(".show-images").unbind("click").on("click", function () {
    let href = $(this).attr("href");
    let modalImagesId = href.replace("#", "");

    let originDataImage = $(`#${modalImagesId}`).find("div.modal-body").html();

    let countRows = Math.ceil($(`#${modalImagesId}`).find("div.all-images>img").length / layoutNumber);
    let layoutStr = new Array(countRows).fill(layoutNumber).join("");
    $(`#${modalImagesId}`).find("div.all-images").photosetGrid({
      highresLinks: true,
      rel: "withhearts-gallery",
      gutter: "2px",
      layout: layoutStr,
      onComplete: function() {
        $(`#${modalImagesId}`).find(".all-images").css({
          "visibility": "visible"
        });
        $(`#${modalImagesId}`).find(".all-images a").colorbox({
          photo: true,
          scalePhotos: true,
          maxHeight: "90%",
          maxWidth: "90%"
        });
      }
    });

    // Close modal event
    $(`#${modalImagesId}`).on("hidden.bs.modal", function () {
      $(this).find("div.modal-body").html(originDataImage);
    })
  });
}


function changeTypeChat() {
  $("#select-type-chat").bind("change", function(){
    let optionSelected = $("option:selected", this);
    optionSelected.tab("show");

    if ($(this).val() === "user-chat") {
      $(".create-group-chat").hide();
    } else {
      $(".create-group-chat").show();
    }
  });
}

// function changeScreenChat() {
//   $(".room-chat").on("click", function () {
//     alert('dont load hể')
//     let divId = $(this).find("li").data("chat");

//     $(".person").removeClass("active");
//     $(`.person[data-chat=${divId}]`).addClass("active");

//     $(this).tab("show");

//     //Cấu hình thanh cuộn bên bõ chat rightSide.ejs mỗi khi ckick vào 1 cuộc trò chuyện cụ thể
//     nineScrollRight(divId);

//     // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn

//     //bật lắng nghe dom cho việc chat tin nhắn hình ảnh
//     imageChat(divId);

//     //Lắng nghe dom cho việc gửi file chat
//     attachmentChat(divId);

//   });
// }

function convertEmoji () {
  $(".convert-emoji").each(function() {
      var original = $(this).html();
      var converted = emojione.toImage(original);
      $(this).html(converted);
  });
}

$(document).ready(function() {
  enableEmojioneArea();

  // Hide số thông báo trên đầu icon mở modal contact
  //showModalContacts();

  // Bật tắt popup notification
  //configNotification();

  // Cấu hình thanh cuộn
  nineScrollLeft();

  // Cấu hình thanh cuộn
 // nineScrollRight();

  // Icon loading khi chạy ajax
  //ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5
  gridPhotos(5);

  //Flash message on master.js
  //flashMasterNotify();

  //Thay đổi kiểu trò chuyện
  //changeTypeChat();

  // Thay đổi màn hình chat
  //changeScreenChat();

  //convert unicode emoji to image emoji
  //convertEmoji();
});
