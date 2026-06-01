const superAdminOnly = (req, res, next) => {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin only.'
    });
  }
  next();
};

module.exports = { superAdminOnly };
