const co = require('co');
const FriendRequest = require('../models/FriendRequest');
const Friend = require('../models/Friend');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const FriendManager = require('../managers/FriendManager');
const BaseManager = require('./BaseManager');

class SearchManager extends BaseManager {
    search(options) {
        const self = this;

        return co(function* search() {
            try {
                return self.searchByType(options);
            } catch(err) {
                return Promise.reject(err);
            }
            
        }); 
    }

    searchByType(options) {
        switch(options.searchType) {
            case "messages":

                return;
            case "contacts": 
                return new FriendManager().search(options);
            case "groups": 

                return;
        }
    }

}

module.exports = SearchManager;