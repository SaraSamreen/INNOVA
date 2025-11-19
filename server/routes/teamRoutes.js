const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Configure email transporter (use your SMTP settings)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// GET all teams for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user.id
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET single team by ID
router.get('/:teamId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is a member
    const isMember = team.members.some(
      member => member.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(team);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST create a new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const newTeam = new Team({
      name: name.trim(),
      description: description || '',
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await newTeam.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: newTeam._id }
    });

    // Populate the team before sending response
    await newTeam.populate('owner', 'name email');
    await newTeam.populate('members.user', 'name email avatar');

    res.status(201).json(newTeam);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// POST invite member to team
router.post('/:teamId/invite', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const { teamId } = req.params;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user has permission to invite
    const member = team.members.find(
      m => m.user.toString() === req.user.id
    );

    // if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    //   return res.status(403).json({ error: 'Only owners and admins can invite members' });
    // }

    // Check if user is already a member
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (invitedUser) {
      const isAlreadyMember = team.members.some(
        m => m.user.toString() === invitedUser._id.toString()
      );
      if (isAlreadyMember) {
        return res.status(400).json({ error: 'User is already a member' });
      }
    }

    // Check if invitation already exists
    const existingInvite = team.invitations.find(
      inv => inv.email === email.toLowerCase() && inv.status === 'pending'
    );

    if (existingInvite) {
      return res.status(400).json({ error: 'Invitation already sent to this email' });
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Add invitation to team
    team.invitations.push({
      email: email.toLowerCase(),
      invitedBy: req.user.id,
      token: inviteToken,
      status: 'pending'
    });

    await team.save();

    // Send email invitation
    const inviteLink = `${process.env.CLIENT_URL}/accept-invite/${inviteToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `You've been invited to join ${team.name} on TeamCollab`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join a team!</h2>
            <p>You've been invited to join <strong>${team.name}</strong> on TeamCollab.</p>
            <p>Click the button below to accept the invitation:</p>
            <a href="${inviteLink}" 
               style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Accept Invitation
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${inviteLink}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This invitation was sent by a member of ${team.name}. 
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
      // Don't fail the request if email fails - the invite link is still valid
    }

    res.json({ 
      message: `Invitation sent to ${email}`,
      token: inviteToken,
      inviteLink
    });
  } catch (err) {
    console.error('Error inviting member:', err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// POST accept team invitation
router.post('/accept-invite/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;

    // Find team with this invitation token
    const team = await Team.findOne({
      'invitations.token': token,
      'invitations.status': 'pending'
    });

    if (!team) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Find the specific invitation
    const invitation = team.invitations.find(
      inv => inv.token === token && inv.status === 'pending'
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Get user email
    const user = await User.findById(req.user.id);
    
    // Verify email matches (case-insensitive)
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ 
        error: 'This invitation was sent to a different email address' 
      });
    }

    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      m => m.user.toString() === req.user.id
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Add user to team members
    team.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date()
    });

    // Update invitation status
    invitation.status = 'accepted';

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { teams: team._id }
    });

    // Populate team data
    await team.populate('owner', 'name email');
    await team.populate('members.user', 'name email avatar');

    res.json({ 
      message: 'Successfully joined the team',
      team 
    });
  } catch (err) {
    console.error('Error accepting invitation:', err);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// DELETE remove member from team
router.delete('/:teamId/members/:userId', auth, async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if requester has permission
    const requester = team.members.find(
      m => m.user.toString() === req.user.id
    );

    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Can't remove the owner
    if (team.owner.toString() === userId) {
      return res.status(400).json({ error: 'Cannot remove team owner' });
    }

    // Remove member
    team.members = team.members.filter(
      m => m.user.toString() !== userId
    );

    await team.save();

    // Remove team from user's teams array
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: teamId }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// DELETE team (only owner)
router.delete('/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Only owner can delete team
    if (team.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the owner can delete the team' });
    }

    // Remove team from all members' teams arrays
    const memberIds = team.members.map(m => m.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { teams: teamId } }
    );

    await Team.findByIdAndDelete(teamId);

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

module.exports = router;