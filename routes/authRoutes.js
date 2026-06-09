const router = require('express').Router();
const c = require('../controllers/authController');
const { registerRules, loginRules, handle } = require('../middleware/validators');

router.get('/register', c.showRegister);
router.post('/register', registerRules, handle, c.register);

router.get('/login', c.showLogin);
router.post('/login', loginRules, handle, c.login);

router.post('/logout', c.logout);
router.get('/logout', c.logout);

router.get('/forgot', c.showForgot);
router.post('/forgot', c.forgot);

router.get('/reset/:token', c.showReset);
router.post('/reset/:token', c.reset);

module.exports = router;
