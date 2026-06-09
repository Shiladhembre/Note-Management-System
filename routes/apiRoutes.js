const router = require('express').Router();
const auth = require('../controllers/authController');
const notes = require('../controllers/noteController');
const { protectApi } = require('../middleware/auth');
const { noteRules, loginRules, handle } = require('../middleware/validators');

// Public
router.post('/auth/login', loginRules, handle, auth.apiLogin);

// Protected JSON API
router.use(protectApi);
router.get('/notes', notes.apiList);
router.post('/notes', noteRules, handle, notes.apiCreate);
router.get('/notes/:id', notes.apiGet);
router.put('/notes/:id', noteRules, handle, notes.apiUpdate);
router.delete('/notes/:id', notes.apiDelete);

module.exports = router;
