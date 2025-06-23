const express = require('express');
const Article = require('../models/Article');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/articles/my - Get admin's articles (move this BEFORE /:id route)
router.get('/my', protect, authorize('admin'), async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your articles',
      error: error.message
    });
  }
});

// GET /api/articles - Get all published articles
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    const articles = await Article.find(query)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Article.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message
    });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar');
    
    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Increment views
    article.views += 1;
    await article.save();
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
});

// POST /api/articles - Create new article (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage, isPublished } = req.body;
    
    const article = await Article.create({
      title,
      content,
      excerpt,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featuredImage,
      isPublished: isPublished || false,
      author: req.user._id
    });
    
    await article.populate('author', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating article',
      error: error.message
    });
  }
});

// PUT /api/articles/:id - Update article (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Only the author or admin can update
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }
    
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');
    
    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating article',
      error: error.message
    });
  }
});

// DELETE /api/articles/:id - Delete article (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    await Article.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message
    });
  }
});

// POST /api/articles/:id/comments - Add comment to article
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const article = await Article.findById(req.params.id);
    
    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    const newComment = {
      user: req.user._id,
      content: content.trim()
    };
    
    article.comments.push(newComment);
    await article.save();
    
    // Populate the new comment
    await article.populate('comments.user', 'name avatar');
    
    const addedComment = article.comments[article.comments.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: addedComment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
});

module.exports = router;