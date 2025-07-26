import Progress from '../models/Progress.js';
import Course from '../models/Course.js';

export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId
    });

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: null // Indique qu'aucune progression n'existe encore
      });
    }

    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

