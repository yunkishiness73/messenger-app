const UserManager = require('../managers/UserManager');

let UserController = function UserController() {};

UserController.prototype.create = (req, res) => {
    let data = req.body;

    return new UserManager().save(data)
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            })
}

UserController.prototype.update = (req, res) => {
    let id = req.params.id;
    let data = req.body;
    
    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Id' } });
    }

    return new UserManager().update(data)
                            .then(entity => {
                                res.status(201).json({ data: entity });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
}

UserController.prototype.getById = (req, res) => {
    let id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: { message: 'Missing Id' } });
    }

    return new UserManager().getById(id)
                          .then(entity => {
                              if (entity == null) {
                                return res.status(404).json({ message: 'Resource not found' });
                              }
                            
                              return res.status(200).json({ data: entity });
                          })
                          .catch(err => {
                            res.status(500).json({ error: err });
                          });
} 

module.exports = UserController.prototype;