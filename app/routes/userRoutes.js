const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Define user routes
router.post('/', userController.createUser);

module.exports = router;
