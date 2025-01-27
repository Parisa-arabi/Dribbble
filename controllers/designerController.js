const Designer = require('../models/Designer');
const Design = require('../models/Design'); 


exports.addDesign = async (req, res) => {
    try {
        const { title, price, category, designerId } = req.body; // getting designerId from request
        const existingDesign = await Design.findOne({ 
            title: title,
            designer: designerId 
        });
        if (existingDesign) {
            return res.status(400).json({
                message: "شما قبلاً طرحی با همین عنوان ثبت کرده‌اید",
                error: "DUPLICATE_TITLE"
            });
        }
        const design = new Design({
            title,
            price,
            category,
            designer: designerId,  // assign it to the designer field
            // other fields...
        });

        const savedDesign = await design.save();
        
        // Update the designer's designs array
        await Designer.findByIdAndUpdate(
            designerId,
            { $push: { designs: savedDesign._id } }
        );

        res.status(201).json({
            message: "طرح با موفقیت اضافه شد.",
            design: savedDesign
        });
    } catch (error) {
        console.error('Error adding design:', error);
        res.status(500).json({
            message: "خطا در اضافه کردن طرح.",
            error: error.message
        });
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
// Get designer's income and purchases
exports.getDesignerIncome = async (req, res) => {
    try {
        const { designerId } = req.params;
        
        // Get all designs by this designer with their purchases
        const designs = await Design.find({ designer: designerId })
            .populate({
                path: 'purchases',
                select: 'purchaseDate price buyer status'
            });

        // Calculate total income and format purchase history
        let totalIncome = 0;
        const purchaseHistory = [];

        designs.forEach(design => {
            design.purchases.forEach(purchase => {
                if (purchase.status === 'completed') {
                    totalIncome += purchase.price;
                    purchaseHistory.push({
                        designTitle: design.title,
                        purchaseDate: purchase.purchaseDate,
                        price: purchase.price,
                        buyer: purchase.buyer
                    });
                }
            });
        });

        res.status(200).json({
            message: "اطلاعات درآمد با موفقیت دریافت شد",
            data: {
                totalIncome,
                purchaseHistory,
                designs: designs.map(design => ({
                    id: design._id,
                    title: design.title,
                    price: design.price,
                    totalSales: design.purchases.length
                }))
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "خطا در دریافت اطلاعات درآمد",
            error: error.message
        });
    }
};

// Edit design
exports.editDesign = async (req, res) => {
    try {
        const { designId } = req.params;
        const updates = req.body;

        // Validate that the design exists
        const design = await Design.findById(designId);
        if (!design) {
            return res.status(404).json({
                message: "طرح مورد نظر یافت نشد"
            });
        }
        if (updates.title && updates.title !== design.title) {
            const existingDesign = await Design.findOne({
                title: updates.title,
                designer: design.designer,
                _id: { $ne: designId } // Exclude current design from check
            });

            if (existingDesign) {
                return res.status(400).json({
                    message: "طرحی با این عنوان قبلاً ثبت شده است",
                    error: "DUPLICATE_TITLE"
                });
            }
        }
        // Update the design
        const updatedDesign = await Design.findByIdAndUpdate(
            designId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "طرح با موفقیت بروزرسانی شد",
            design: updatedDesign
        });

    } catch (error) {
        res.status(500).json({
            message: "خطا در بروزرسانی طرح",
            error: error.message
        });
    }
};

// Delete design
exports.deleteDesign = async (req, res) => {
    try {
        const { designId } = req.params;

        // Validate that the design exists
        const design = await Design.findById(designId);
        if (!design) {
            return res.status(404).json({
                message: "طرح مورد نظر یافت نشد"
            });
        }

        // Check if the design has any purchases
        const hasPurchases = design.purchases && design.purchases.length > 0;
        if (hasPurchases) {
            return res.status(400).json({
                message: "این طرح دارای خرید است و قابل حذف نمی‌باشد"
            });
        }

        // Delete the design
        await Design.findByIdAndDelete(designId);

        // Remove design reference from designer's designs array
        await Designer.findByIdAndUpdate(
            design.designer,
            { $pull: { designs: designId } }
        );

        res.status(200).json({
            message: "طرح با موفقیت حذف شد"
        });

    } catch (error) {
        res.status(500).json({
            message: "خطا در حذف طرح",
            error: error.message
        });
    }
};