const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const slugify = require('slugify');
const sendEmailNotification = require('../utils/sendEmail');

// @desc    Get all posts (with filters)
// @route   GET /api/posts
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by status
        // Admins can see all posts (including pending) when status=all
        if (req.query.status === 'all' && req.user && req.user.role === 'admin') {
            // Don't add status filter — show everything
        } else if (!req.user || (req.user.role === 'user' && req.query.author !== req.user._id.toString())) {
            query.status = 'published';
        } else if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by author
        if (req.query.author) {
            query.author = req.query.author;
        }

        // Filter by tag
        if (req.query.tag) {
            query.tags = { $in: [req.query.tag] };
        }

        // Filter by featured
        if (req.query.featured === 'true') {
            query.featured = true;
        }

        // Search
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { content: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sort
        let sort = { createdAt: -1 };
        if (req.query.sort === 'popular') {
            sort = { views: -1 };
        } else if (req.query.sort === 'likes') {
            sort = { likes: -1 };
        } else if (req.query.sort === 'oldest') {
            sort = { createdAt: 1 };
        }

        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .populate('author', 'username avatar role')
            .populate('category', 'name slug color')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        res.json({
            posts,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('author', 'username avatar bio socialLinks role')
            .populate('category', 'name slug color');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment views
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new post
// @route   POST /api/posts
const createPost = async (req, res) => {
    try {
        const { title, content, excerpt, coverImage, category, tags, status, featured } = req.body;

        // Generate unique slug
        let slug = slugify(title, { lower: true, strict: true });
        const existingPost = await Post.findOne({ slug });
        if (existingPost) {
            slug = slug + '-' + Date.now();
        }

        let finalExcerpt = excerpt;
        if (!finalExcerpt && content) {
            finalExcerpt = content.replace(/[#*`>\-\[\]()!]/g, '').substring(0, 200) + '...';
        }

        let finalStatus = status || 'published';

        const post = await Post.create({
            title,
            slug,
            content,
            excerpt: finalExcerpt,
            coverImage,
            author: req.user._id,
            category,
            tags: tags || [],
            status: finalStatus,
            featured: featured || false
        });

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar role')
            .populate('category', 'name slug color');

        // Sending basic email notification
        sendEmailNotification(
            "subscribers@blogverse.com",
            `New Post Published: ${post.title}`,
            `A new blog post has been published by an author!`
        );

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership or admin
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        const { title, content, excerpt, coverImage, category, tags, status, featured } = req.body;

        if (title && title !== post.title) {
            let slug = slugify(title, { lower: true, strict: true });
            const existingPost = await Post.findOne({ slug, _id: { $ne: post._id } });
            if (existingPost) {
                slug = slug + '-' + Date.now();
            }
            post.slug = slug;
        }

        if (title) post.title = title;
        if (content) {
            post.content = content;
            if (excerpt === undefined) {
                post.excerpt = content.replace(/[#*`>\-\[\]()!]/g, '').substring(0, 200) + '...';
            }
        }
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (coverImage !== undefined) post.coverImage = coverImage;
        if (category !== undefined) post.category = category;
        if (tags) post.tags = tags;
        if (status) post.status = status;
        if (featured !== undefined) post.featured = featured;

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar role')
            .populate('category', 'name slug color');

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership or admin
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Delete associated comments
        await Comment.deleteMany({ post: post._id });

        await Post.findByIdAndDelete(post._id);

        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upvote post
// @route   PUT /api/posts/:id/upvote
const toggleUpvote = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove from downvotes if exists
        const downIndex = post.downvotes.indexOf(req.user._id);
        if (downIndex > -1) {
            post.downvotes.splice(downIndex, 1);
        }

        const upIndex = post.upvotes.indexOf(req.user._id);
        if (upIndex > -1) {
            post.upvotes.splice(upIndex, 1);
        } else {
            post.upvotes.push(req.user._id);
        }

        await post.save();
        res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Downvote post
// @route   PUT /api/posts/:id/downvote
const toggleDownvote = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove from upvotes if exists
        const upIndex = post.upvotes.indexOf(req.user._id);
        if (upIndex > -1) {
            post.upvotes.splice(upIndex, 1);
        }

        const downIndex = post.downvotes.indexOf(req.user._id);
        if (downIndex > -1) {
            post.downvotes.splice(downIndex, 1);
        } else {
            post.downvotes.push(req.user._id);
        }

        await post.save();
        res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Editor's Pick (Admin)
// @route   PUT /api/posts/:id/editors-pick
const toggleEditorsPick = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.featured = !post.featured; // Using featured as Editor's pick
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tags
// @route   GET /api/posts/tags/all
const getAllTags = async (req, res) => {
    try {
        const tags = await Post.distinct('tags', { status: 'published' });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a pending post (Admin only)
// @route   PUT /api/posts/:id/approve
const approvePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.status = 'published';
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar role')
            .populate('category', 'name slug color');

        sendEmailNotification(
            "author@blogverse.com",
            `Your Post Has Been Approved: ${post.title}`,
            `Congratulations! Your post "${post.title}" has been approved and is now live.`
        );

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a pending post (Admin only)
// @route   PUT /api/posts/:id/reject
const rejectPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.status = 'rejected';
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username avatar role')
            .populate('category', 'name slug color');

        sendEmailNotification(
            "author@blogverse.com",
            `Your Post Has Been Rejected: ${post.title}`,
            `Your post "${post.title}" has been rejected. Please review and resubmit.`
        );

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bookmark post
// @route   PUT /api/posts/:id/bookmark
const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = user.bookmarks.indexOf(post._id);
        if (index > -1) {
            user.bookmarks.splice(index, 1);
        } else {
            user.bookmarks.push(post._id);
        }
        await user.save();
        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookmarked posts
// @route   GET /api/posts/bookmarks/my
const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks',
            populate: [
                { path: 'author', select: 'username avatar role' },
                { path: 'category', select: 'name slug' }
            ]
        });
        res.json(user.bookmarks || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPosts, getPostBySlug, createPost, updatePost, deletePost, toggleUpvote, toggleDownvote, toggleEditorsPick, toggleBookmark, getBookmarks, getAllTags, approvePost, rejectPost };
