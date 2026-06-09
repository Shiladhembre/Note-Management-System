const router = require('express').Router();
const c = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { noteRules, handle } = require('../middleware/validators');

router.use(protect);

router.get('/', c.list);
router.get('/new', c.showNew);
router.post('/', noteRules, handle, c.create);

router.get('/:id/edit', c.showEdit);
router.put('/:id', noteRules, handle, c.update);

router.post('/:id/pin', c.togglePin);
router.post('/:id/archive', c.toggleArchive);
router.post('/:id/favorite', c.toggleFavorite);
router.post('/:id/restore', c.restore);
router.delete('/:id', c.softDelete);
router.delete('/:id/permanent', c.destroy);

router.get('/:id/export', c.exportNote);

module.exports = router;
