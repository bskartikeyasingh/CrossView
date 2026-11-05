const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const logout = async (req, res) => {
  return res.json({
    success: true,
    message: 'Signed out successfully.',
  });
};

module.exports = { getMe, logout };
