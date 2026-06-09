const router = require('express').Router();
const c = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);

router.get('/', c.show);
router.put('/', upload.single('avatar'), c.update);
router.put('/password', c.changePassword);

module.exports = router;
