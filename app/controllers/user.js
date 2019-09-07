const { findAllUsers } = require('../interactors/user');

exports.getUsers = (req, res, next) =>
  findAllUsers()
    .then(users => res.status(200).send(users))
    .catch(next);
