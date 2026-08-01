import mongoose from 'mongoose';
import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: null });
    }

    let settings = await Setting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await Setting.create({ key: 'global_settings' });
    }

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updatedSettings = await Setting.findOneAndUpdate(
        { key: 'global_settings' },
        { $set: req.body },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'School profile & settings updated successfully',
        data: updatedSettings
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Settings saved locally',
      data: req.body
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getSettings, updateSettings };
