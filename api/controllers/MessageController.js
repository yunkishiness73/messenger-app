const MessageManager = require('../managers/MessageManager');
const ConversationManager = require('../managers/ConversationManager');
var cloudinary = require('cloudinary').v2;
const fs = require('fs');

let MessageController = function MessageController() {};

MessageController.prototype.create = (req, res) => {
    let attachment;
    let currentUser = req.user;
    let { receiverID, conversationType, message, conversationID, messageType, title } = req.body;
    let file = req.file;

    if (file) {
        attachment = {
            fileName: file.filename,
            fileURL: file.path.replace(/\\/g, "/"),
            fileSize: file.size,
            fileType: file.mimetype
        }
    }

    // cloudinary.config({ 
    //     cloud_name: 'kietnguyencloud', 
    //     api_key: '287666537461618', 
    //     api_secret: 'J7Pk6h1Vol8ij2P0FXiN6mbhzIc' 
    // });

    // cloudinary.uploader.upload(attachment.fileURL, { resource_type: "raw" }, function(err, result) {
    //     console.log(result);
    //     console.log(err);
    //     fs.unlinkSync(attachment.fileURL);
    //     res.download('https://res.cloudinary.com/kietnguyencloud/raw/upload/v1591282260/coodl9tpt20q1gfhnm8q.pdf', 'coodl9tpt20q1gfhnm8q.pdf');
                
    // });
                    

    // if (!conversationID) {
    //     return new ConversationManager()
    //                .save({ senderID: currentUser._id, receiverID, type: conversationType })
    //                .then(conversationEntity => {
    //                     let payload = {
    //                         conversationID: conversationEntity._id,
    //                         message,
    //                         senderID: currentUser._id,
    //                         type: messageType,
    //                         attachment
    //                     };

    //                    return new MessageManager().save(payload);
    //                 })
    //                 .then(messageEntity => {
    //                     return res.status(201).json({ data: messageEntity });
    //                 })
    //                 .catch(err => {
    //                     return res.status(500).json({ error: err });
    //                 });
    // }
    
    // return new ConversationManager()
    //                .getById(conversationID)
    //                .then(conversationEntity => {
    //                    if (!conversationEntity) {
    //                        return res.status(404).json({ error: {
    //                            message: 'Conversation not found'
    //                        } });
    //                    }

    //                    if (!conversationEntity.members.includes(currentUser._id)) {
    //                         return res.status(403).json({ error: {
    //                             message: 'Not allowed to send message to this conversation'
    //                         } });
    //                    }

    //                     return new MessageManager().save({ conversationID, type: messageType, senderID: currentUser._id, message, attachment })
    //                 })
    //                 .then(messageEntity => {
    //                     res.status(201).json({ data: messageEntity });
    //                 })
    //                 .catch(err => {
    //                     res.status(500).json({ error: err });
    //                 });
}

module.exports = MessageController.prototype;