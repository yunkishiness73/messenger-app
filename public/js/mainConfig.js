const socket = io();


function nineScrollLeft() {
  $('.left').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function nineScrollRight(divId) {
  $(`.right .chat[data-chat = ${divId}]`).niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
  $(`.right .chat[data-chat = ${divId}]`).scrollTop($(`.right .chat[data-chat = ${divId}]`)[0].scrollHeight);
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
          let conversationID = $('#write-chat').attr('data-chat');
          let message = $.trim($('#write-chat').val());
         
          if (message) {
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
                      fetchConversations();
                      
                      $('.emojionearea-editor').html('');
                      appendToMessageList(data['data']);
                    }
                },
                error: errorHandler.onError
            })
          }
        }
      },
      click: function() {
        
        // //Bật lắng nghe dom cho việc chat tin nhắn văn bản emoji
        // textAndEmojiChat();
        // // Bật chức năng typing on
        // typingOn(divId);
      },
      blur: function () {
        // // Tắt chức năng typing on
        // typingOff(divId);
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

function flashMasterNotify() {
  let notify = $(".master-success-message").text();
  if (notify.length) {
    alertify.notify(notify, "success", 7);
  }
};

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

function changeScreenChat() {
  $(".room-chat").on("click", function () {
    alert('click')
    let divId = $(this).find("li").data("chat");

    $(".person").removeClass("active");
    $(`.person[data-chat=${divId}]`).addClass("active");

    $(this).tab("show");

    //Cấu hình thanh cuộn bên bõ chat rightSide.ejs mỗi khi ckick vào 1 cuộc trò chuyện cụ thể
    nineScrollRight(divId);

    // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn

    //bật lắng nghe dom cho việc chat tin nhắn hình ảnh
    imageChat(divId);

    //Lắng nghe dom cho việc gửi file chat
    attachmentChat(divId);

    // Lắng nghe dom cho việc video call
    videoChat(divId);
  });
}

function convertEmoji () {
  $(".convert-emoji").each(function() {
      var original = $(this).html();
      var converted = emojione.toImage(original);
      $(this).html(converted);
  });
}

function bufferToBase64 (buffer) {
  return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
};

$(document).ready(function() {
  enableEmojioneArea();

  // Hide số thông báo trên đầu icon mở modal contact
  showModalContacts();

  // Bật tắt popup notification
  configNotification();

  // Cấu hình thanh cuộn
  nineScrollLeft();

  // Icon loading khi chạy ajax
  ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5
  gridPhotos(5);

  //Flash message on master.js
  flashMasterNotify();

  //Thay đổi kiểu trò chuyện
  changeTypeChat();

  // Thay đổi màn hình chat
  changeScreenChat();

  //click vào phần tử đầu tiên của cuộc trò chuyện khi load trang web
  $("ul.people").find("a")[0].click();

  //convert unicode emoji to image emoji
  convertEmoji();

  $("#video-chat-group").bind("click", function() {
    alertify.notify("Tính năng này ko khả dụng với cuộc hội thoại nhóm. Vui lòng thử lại trên trò truyện cá nhân", "error", 7);
  })
});
