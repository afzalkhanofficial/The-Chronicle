const express = require('express');
const router = express.Router();
const { getComments, createComment, deleteComment, toggleCommentUpvote, toggleCommentDownvote } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:postId', getComments);
router.post('/:postId', protect, createComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/upvote', protect, toggleCommentUpvote);
router.put('/:id/downvote', protect, toggleCommentDownvote);

module.exports = router;
