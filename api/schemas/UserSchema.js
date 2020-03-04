module.exports = {
    'title': 'Note Schema',
    'type': 'object',
    'properties': {
        'status': {
            'type': 'string'
        },
        'username': {
            'type': 'string'
        },
        'password': {
            'type': 'string'
        },
        'firstName': {
            'type': 'string'
        },
        'lastName': {
            'type': 'string'
        },
        'displayName': {
            'type': 'string'
        },
        'isActive': {
            'type': 'string'
        }
    },
    'additionalProperties': true,
    'required': ['username', 'password', 'firstName', 'lastName', 'displayName']
}