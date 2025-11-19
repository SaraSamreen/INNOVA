const User = require("../models/User");

// ---------------- Update Profile ----------------
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateFields = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Delete Account ----------------
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Forgot Password ----------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // TODO: implement password reset logic
    res.json({ message: `Password reset link sent to ${email}` });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};
