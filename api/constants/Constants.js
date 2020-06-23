module.exports = {
    BASE_URL: 'http://localhost:1337/api',

    CONVERSATION_TYPE: {
        Group: 'Group',
        Single: 'Single'
    },

    pageSize: 30,

    CONVERSATION_MESSAGE: {
        Added: '$1 added $2 to this conversation',
        Leaved: '$1 leaved this conversation',
        Removed: '$1 has removed $2 from this conversation',
        Renamed: '$1 has renamed the conversation to $2',
        Joined: '$1 joined this conversation'
    },

    USER_STATUS: {
        Enabled: 'Enabled',
        Locked: 'Locked',
        Disabled: 'Disabled',
        Pending: 'Pending'
    },

    MESSAGE_TYPE: {
        Text: 'Text',
        Image: 'Image',
        Video: 'Video',
        Others: 'Others',
        Notif: 'Notif'  
    },

    SEARCH_TYPE: {
        Contact: 'contacts',
        Friend: 'friends'
    }

}