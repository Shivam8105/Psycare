export const completeGoogleLogin = async (req, res) => {
  try {
    const { token, role, name, email, avatar, funnyName } = req.body;
    if (!token || !role) {
      return res.status(400).json({ message: 'Token and role are required.' });
    }
    // Decode token to get user id
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    let user = await User.findById(userId);
    if (!user) {
      // Create new user if not found
      user = new User({
        _id: userId,
        name,
        email,
        role,
        avatar,
        funnyName,
        password: '', // Google users don't need password
      });
      await user.save();
    } else if (!user.role) {
      user.role = role;
      await user.save();
    }
    // Generate new token with updated role
    const newToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Google login completed.',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        funnyName: user.funnyName
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};