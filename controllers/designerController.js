// backend/controllers/designerController.js

const Designer = require('../models/Designer');

// افزودن طرح جدید برای طراح
exports.addDesign = async (req, res) => {
  try {
    const designer = await Designer.findById(req.body.designerId);
    designer.designs.push(req.body.designId);
    await designer.save();
    res.status(200).json({ message: "طرح با موفقیت اضافه شد." });
  } catch (error) {
    res.status(500).json({ message: "خطا در اضافه کردن طرح.", error });
  }
};

// مشاهده لیست طرح‌ها برای طراح
exports.viewDesigns = async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id).populate('designs');
    res.status(200).json(designer.designs);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت طرح‌ها.", error });
  }
};

// مشاهده درآمد طراح
exports.viewIncome = async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id);
    res.status(200).json({ income: designer.income });
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت درآمد.", error });
  }
};
