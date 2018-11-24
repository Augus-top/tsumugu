const express = require('express');
const controller = require('../controllers/vndbController');

const router = express.Router();

router.get('/user/id/:userID', async (req, res, next) => {
  const user = await controller.getUserByID(req.params.userID);
  (user === 'error' || user.length === 0)
    ? res.status(404).send({error:`User with id ${req.params.userID} was not found`})
    : res.send(user);
});

router.get('/user/name/:userName', async (req, res, next) => {
  const user = await controller.getUserByName(req.params.userName);
  (user === 'error' || user.length === 0)
    ? res.status(404).send({error:`User with name ${req.params.userName} was not found`})
    : res.send(user);
});

router.get('/user/list/:userID', async (req, res, next) => {
  const list = await controller.getUserList(req.params.userID);
  (list === 'error' || list.length === 0)
    ? res.status(404).send({error:`List for id ${req.params.userID} was not found`})
    : res.send(list);
});

router.get('/user/formatedlist/:userID', async (req, res, next) => {
  const list = await controller.getFormatedUserList(req.params.userID);
  (list === 'error' || list.length === 0)
    ? res.status(404).send({error:`List for id ${req.params.userID} was not found`})
    : res.send(list);
});

module.exports = router;
