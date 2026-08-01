import Announcement from '../models/Announcement.js';

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    const formatted = announcements.map(a => ({
      id: a.announcementId || String(a._id),
      title: a.title,
      body: a.body,
      type: a.type,
      authorName: a.authorName,
      timestamp: a.timestamp,
      targetRole: a.targetRole
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { title, body, type, authorName, targetRole } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    const count = await Announcement.countDocuments();
    const announcementId = `anc_${count + 1}`;
    const timestamp = new Date().toISOString().split('T')[0];

    const newAnnouncement = await Announcement.create({
      announcementId,
      title,
      body,
      type: type || 'general',
      authorName: authorName || 'Principal Office',
      timestamp,
      targetRole: targetRole || 'all'
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: {
        id: newAnnouncement.announcementId,
        title: newAnnouncement.title,
        body: newAnnouncement.body,
        type: newAnnouncement.type,
        authorName: newAnnouncement.authorName,
        timestamp: newAnnouncement.timestamp,
        targetRole: newAnnouncement.targetRole
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findOneAndDelete({
      $or: [{ announcementId: req.params.id }, { _id: req.params.id }]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getAnnouncements, createAnnouncement, deleteAnnouncement };
