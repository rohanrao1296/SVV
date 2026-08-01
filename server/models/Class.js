import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  name: { type: String, required: true }
});

const ClassSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sections: [SectionSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Class', ClassSchema);
