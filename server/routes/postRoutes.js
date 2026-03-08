const express = require('express');
const router = express.Router();
const { getPosts, getPostBySlug, createPost, updatePost, deletePost, toggleUpvote, toggleDownvote, toggleEditorsPick, toggleBookmark, getBookmarks, getAllTags, approvePost, rejectPost } = require('../controllers/postController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.get('/tags/all', getAllTags);
router.get('/bookmarks/my', protect, getBookmarks);
router.get('/', optionalAuth, getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', protect, authorize('admin', 'author', 'user'), createPost);
router.put('/:id', protect, authorize('admin', 'author', 'user'), updatePost);
router.delete('/:id', protect, authorize('admin', 'author', 'user'), deletePost);
router.put('/:id/upvote', protect, toggleUpvote);
router.put('/:id/downvote', protect, toggleDownvote);
router.put('/:id/editors-pick', protect, authorize('admin'), toggleEditorsPick);
router.put('/:id/bookmark', protect, toggleBookmark);
router.put('/:id/approve', protect, authorize('admin'), approvePost);
router.put('/:id/reject', protect, authorize('admin'), rejectPost);

module.exports = router;
