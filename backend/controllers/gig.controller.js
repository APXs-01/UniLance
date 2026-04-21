// Member 3 - Gig Controller (Freelancer Service Listings, GitHub Integration)
const Gig = require("../models/Gig");
const axios = require("axios");

// ─── Member 3 - Verify GitHub Repository ─────────────────────────────────────
const verifyGitHubRepo = async (repoUrl) => {
  try {
    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return { valid: false, message: "Invalid GitHub repository URL." };

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${cleanRepo}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return {
      valid: true,
      repoData: { 
        fullName: response.data.full_name,
        description: response.data.description,
        stars: response.data.stargazers_count,
        language: response.data.language,
        url: response.data.html_url,
      },
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { valid: false, message: "GitHub repository not found or is private." };
    }
    return { valid: false, message: "Could not verify GitHub repository." };
  }
};

// ─── Member 3 - Create Gig ────────────────────────────────────────────────────
// POST /api/gigs
const createGig = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Only freelancers can create gigs." });
    }

    const {
      title, description, category, tags, price, currency,
      deliveryDays, revisions, coverImage, gallery,
      githubRepoUrl, githubUsername,
    } = req.body;

    if (!title || !description || !category || !price || !deliveryDays) {
      return res.status(400).json({ success: false, message: "Title, description, category, price, and delivery days are required." });
    }

    // ─── Member 3 - Verify GitHub repo if provided ────────────────────────────
    if (githubRepoUrl) {
      const repoVerification = await verifyGitHubRepo(githubRepoUrl);
      if (!repoVerification.valid) {
        return res.status(400).json({ success: false, message: repoVerification.message });
      }
    }

    const gig = await Gig.create({
      freelancer: req.user._id,
      title,
      description,
      category,
      tags: tags || [],
      price,
      currency: currency || "USD",
      deliveryDays,
      revisions: revisions || 1,
      coverImage: coverImage || "",
      gallery: gallery || [],
      githubRepoUrl: githubRepoUrl || "",
      githubUsername: githubUsername || "",
    });

    res.status(201).json({
      success: true,
      message: "Gig created successfully.",
      gig,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Update Gig ────────────────────────────────────────────────────
// PUT /api/gigs/:gigId
const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found." });
    }

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Validate new GitHub repo if changed
    if (req.body.githubRepoUrl && req.body.githubRepoUrl !== gig.githubRepoUrl) {
      const repoVerification = await verifyGitHubRepo(req.body.githubRepoUrl);
      if (!repoVerification.valid) {
        return res.status(400).json({ success: false, message: repoVerification.message });
      }
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.gigId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Gig updated.", gig: updatedGig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Delete Gig ────────────────────────────────────────────────────
// DELETE /api/gigs/:gigId
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found." });
    }

    const isOwner = gig.freelancer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await Gig.findByIdAndUpdate(req.params.gigId, { isActive: false });

    res.status(200).json({ success: true, message: "Gig deactivated." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Get Single Gig ────────────────────────────────────────────────
// GET /api/gigs/:gigId
const getGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId)
      .populate("freelancer", "name profilePicture university skills availability totalOrdersCompleted portfolioSlug");

    if (!gig || !gig.isActive) {
      return res.status(404).json({ success: false, message: "Gig not found." });
    }

    // ─── Member 3 - Fetch GitHub repo details if linked ───────────────────────
    let githubData = null;
    if (gig.githubRepoUrl) {
      const result = await verifyGitHubRepo(gig.githubRepoUrl);
      if (result.valid) githubData = result.repoData;
    }

    res.status(200).json({ success: true, gig, githubData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Browse/Search/Filter Gigs (Buyers) ───────────────────────────
// GET /api/gigs
const getGigs = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      deliveryDays, sort = "newest", page = 1, limit = 12,
    } = req.query;

    const query = { isActive: true };

    // ─── Member 3 - Full-text search ──────────────────────────────────────────
    if (search) {
      query.$text = { $search: search };
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (deliveryDays) query.deliveryDays = { $lte: parseInt(deliveryDays) };

    // ─── Member 3 - Sort options ───────────────────────────────────────────────
    const sortOptions = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt: 1 },
      price_low:  { price: 1 },
      price_high: { price: -1 },
      top_rated:  { averageRating: -1 },
      popular:    { totalOrders: -1 },
    };

    const total = await Gig.countDocuments(query);
    const gigs = await Gig.find(query)
      .populate("freelancer", "name profilePicture university")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      gigs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Get Freelancer's Own Gigs ────────────────────────────────────
// GET /api/gigs/my-gigs
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ freelancer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, gigs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGig,
  updateGig,
  deleteGig,
  getGig,
  getGigs,
  getMyGigs,
};
