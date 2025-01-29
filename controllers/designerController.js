// const Designer = require('../models/Designer');
const Design = require('../models/Design'); 


exports.addDesign = async (req, res) => {
    try {
        const { title, price, category, designerId="507f1f77bcf86cd799439011",purchase=false,description } = req.body; // getting designerId from request
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
            purchase: purchase,
            description
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
      // Instead of looking for designs in the designer document
      // Let's query the designs collection directly using the designer ID
      const designs = await Design.find({ designer: "507f1f77bcf86cd799439011" });
      
      if (!designs || designs.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No designs found for this designer",
          designs: []
        });
      }
  
      return res.status(200).json({
        success: true,
        count: designs.length,
        designs: designs
      });
  
    } catch (error) {
      console.error('Error in viewDesigns:', error);
      return res.status(500).json({
        success: false,
        message: "error loading designer",
        error: error.message
      });
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
        // Get designerId from query params or session
        const designerId = req.query.designerId || req.session.designerId;
        console.log("controller",designerId)
        if (!designerId) {
            return res.status(400).json({
                message: "شناسه طراح مورد نیاز است",
                error: "DESIGNER_ID_REQUIRED"
            });
        }

        // Get all designs by this designer where purchase is true
        const designs = await Design.find({ 
            designer: designerId,
            purchase: true
        });

        // Calculate total income and format purchase history
        const totalIncome = designs.reduce((sum, design) => sum + design.price, 0);
        
        // Format the response data
        const purchaseHistory = designs.map(design => ({
            designTitle: design.title,
            purchaseDate: design.createdAt,
            price: design.price
        }));

        res.status(200).json({
            message: "اطلاعات درآمد با موفقیت دریافت شد",
            data: {
                totalIncome,
                purchaseHistory,
                designs: designs.map(design => ({
                    id: design._id,
                    title: design.title,
                    price: design.price
                })),
                totalSales: designs.length
            }
        });

    } catch (error) {
        console.error('Error getting designer income:', error);
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
exports.getDesign = async (req, res) => {
    try {
        const { designId } = req.params;
        const design = await Design.findById(designId);
        
        if (!design) {
            return res.status(404).json({
                success: false,
                message: 'طرح مورد نظر یافت نشد'
            });
        }

        res.json({
            success: true,
            design
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت اطلاعات طرح'
        });
    }
};