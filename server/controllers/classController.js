import mongoose from 'mongoose';
import ClassModel from '../models/Class.js';

export const getClasses = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const classes = await ClassModel.find().sort({ createdAt: 1 });
    const formatted = classes.map(c => ({
      id: c.classId || String(c._id),
      name: c.name,
      sections: c.sections && c.sections.length > 0 ? c.sections.map(s => ({ id: s.sectionId, name: s.name })) : [
        { id: 's_a', name: 'A' },
        { id: 's_b', name: 'B' },
        { id: 's_c', name: 'C' }
      ]
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, sections } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Class name is required' });
    }

    let count = 0;
    if (mongoose.connection.readyState === 1) {
      count = await ClassModel.countDocuments();
    }

    const classId = `c_${Date.now()}`;
    const formattedSections = (sections && sections.length > 0)
      ? sections.map((secName, idx) => ({ sectionId: `s_${idx + 1}`, name: secName }))
      : [
          { sectionId: 's_a', name: 'A' },
          { sectionId: 's_b', name: 'B' },
          { sectionId: 's_c', name: 'C' }
        ];

    let newClass = null;
    if (mongoose.connection.readyState === 1) {
      newClass = await ClassModel.create({
        classId,
        name,
        sections: formattedSections
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass ? { id: newClass.classId, name: newClass.name, sections: formattedSections } : { id: classId, name, sections: formattedSections }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { name, sections } = req.body;
    const targetId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const formattedSections = sections ? sections.map((sec, idx) => ({
        sectionId: typeof sec === 'object' ? sec.id || sec.sectionId : `s_${idx + 1}`,
        name: typeof sec === 'object' ? sec.name : sec
      })) : undefined;

      const updated = await ClassModel.findOneAndUpdate(
        { $or: [{ classId: targetId }, { _id: targetId }] },
        {
          $set: {
            ...(name ? { name } : {}),
            ...(formattedSections ? { sections: formattedSections } : {})
          }
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Class not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Class updated successfully',
        data: {
          id: updated.classId || String(updated._id),
          name: updated.name,
          sections: updated.sections.map(s => ({ id: s.sectionId, name: s.name }))
        }
      });
    }

    return res.status(200).json({ success: true, message: 'Class updated locally', data: req.body });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      await ClassModel.findOneAndDelete({
        $or: [{ classId: targetId }, { _id: targetId }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { getClasses, createClass, updateClass, deleteClass };
