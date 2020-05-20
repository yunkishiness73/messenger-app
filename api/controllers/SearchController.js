const ConversationManager = require('../managers/ConversationManager');
const SearchManager = require('../managers/SearchManager');

let SearchController = function SearchController() {};

SearchController.prototype.search = (req, res) => {
    let currentUser = req.user;
    let q = req.query['q'];
    let searchType = req.query['searchType'];

    return new SearchManager()
                .search({ userID: currentUser._id, q, searchType })
                .then(result => {
                    return res.status(200).json({ data: result });
                })
                .catch(err => {
                    return res.status(500).json({ err });
                });
}

module.exports = SearchController.prototype;