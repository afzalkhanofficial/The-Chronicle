const Comment = require('../models/Comment');
const Post = require('../models/Post');
const sendEmailNotification = require('../utils/sendEmail');

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId, parentComment: null })
            .populate('user', 'username avatar role')
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('user', 'username avatar role')
                    .sort({ createdAt: 1 });
                return { ...comment.toObject(), replies };
            })
        );

        res.json(commentsWithReplies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create comment
// @route   POST /api/comments/:postId
const createComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await Comment.create({
            content: req.body.content,
            post: req.params.postId,
            user: req.user._id,
            parentComment: req.body.parentComment || null
        });

        // Update comment count on post
        post.commentsCount += 1;
        await post.save();

        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'username avatar role');

        // Real-time: emit the new comment to all users viewing this post
        const io = req.app.get('io');
        if (io) {
            io.to(req.params.postId).emit('newComment', {
                comment: populatedComment,
                parentId: req.body.parentComment || null
            });
        }

        sendEmailNotification(
            "author@blogverse.com",
            `New Comment on Your Post`,
            `User ${req.user._id} commented: "${comment.content}"`
        );

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership or admin
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete replies
        await Comment.deleteMany({ parentComment: comment._id });

        // Update comment count
        const post = await Post.findById(comment.post);
        if (post) {
            const deletedCount = await Comment.countDocuments({ parentComment: comment._id });
            post.commentsCount = Math.max(0, post.commentsCount - 1 - deletedCount);
            await post.save();
        }

        await Comment.findByIdAndDelete(comment._id);

        // Real-time: emit comment deletion
        const io = req.app.get('io');
        if (io) {
            io.to(comment.post.toString()).emit('deleteComment', {
                commentId: comment._id,
                parentId: comment.parentComment
            });
        }

        res.json({ message: 'Comment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upvote comment
// @route   PUT /api/comments/:id/upvote
const toggleCommentUpvote = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const downIndex = comment.downvotes.indexOf(req.user._id);
        if (downIndex > -1) {
            comment.downvotes.splice(downIndex, 1);
        }

        const upIndex = comment.upvotes.indexOf(req.user._id);
        if (upIndex > -1) {
            comment.upvotes.splice(upIndex, 1);
        } else {
            comment.upvotes.push(req.user._id);
        }

        await comment.save();
        res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Downvote comment
// @route   PUT /api/comments/:id/downvote
const toggleCommentDownvote = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const upIndex = comment.upvotes.indexOf(req.user._id);
        if (upIndex > -1) {
            comment.upvotes.splice(upIndex, 1);
        }

        const downIndex = comment.downvotes.indexOf(req.user._id);
        if (downIndex > -1) {
            comment.downvotes.splice(downIndex, 1);
        } else {
            comment.downvotes.push(req.user._id);
        }

        await comment.save();
        res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getComments, createComment, deleteComment, toggleCommentUpvote, toggleCommentDownvote };
