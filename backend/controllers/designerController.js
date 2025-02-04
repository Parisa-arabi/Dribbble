const Designer = require('../models/Designer');
const Design = require('../models/Design'); 
const { getDB } = require('../config/db');
const { client } = require('../config/db'); 
const { ObjectId } = require('mongodb'); // Add this for ID handling
// Function to get the database and collection  
exports.addDesign = async (req, res) => {
    const db = getDB();
    const session = db.client.startSession();
    
    try {
        await session.withTransaction(async () => {
            const designerId = req.designer._id;
            const designerEmail = req.designer.email;
            const { title, price, category, purchase = false, description } = req.body;

            // Get collections
            const designsCollection = db.collection('designs');
            const designersCollection = db.collection('designers');
            
            // Check for existing design
            const existingDesign = await designsCollection.findOne({
                title: title,
                designer: designerId
            }, { session });

            if (existingDesign) {
                throw new Error('DUPLICATE_TITLE');
            }

            // Create design document
            const designDoc = {
                title,
                price: Number(price), // Ensure price is a number
                category,
                designer: new ObjectId(designerId),
                purchase,
                description,
                designerEmail,
                createdAt: new Date()
            };

            // Insert the design
            const result = await designsCollection.insertOne(designDoc, { session });
            
            // Update designer's designs array
            await designersCollection.updateOne(
                { _id: new ObjectId(designerId) },
                { $push: { designs: result.insertedId } },
                { session }
            );

            // Return success response
            res.status(201).json({
                success: true,
                message: "طرح با موفقیت اضافه شد.",
                design: {
                    ...designDoc,
                    _id: result.insertedId
                }
            });
        });

    } catch (error) {
        console.error('Error adding design:', error);
        
        // Handle specific errors
        if (error.message === 'DUPLICATE_TITLE') {
            return res.status(400).json({
                success: false,
                message: "شما قبلاً طرحی با همین عنوان ثبت کرده‌اید",
                error: "DUPLICATE_TITLE"
            });
        }

        res.status(500).json({
            success: false,
            message: "خطا در اضافه کردن طرح.",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};
exports.viewDesigns = async (req, res) => {
    try {
        if (!req.designer || !req.designer._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const designerId = req.designer._id;
        const db = getDB();
        const designsCollection = db.collection('designs');

        // Convert string ID to ObjectId if necessary
        const designerObjectId = typeof designerId === 'string' ? new ObjectId(designerId) : designerId;

        const designs = await designsCollection.find({ designer: designerObjectId }).toArray();
        
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
            message: "Error loading designs",
            error: error.message
        });
    }
};
exports.viewIncome = async (req, res) => {
    try {
        const db = getDB();
        const designersCollection = db.collection('designers');
        
        const designerId = new ObjectId(req.params.id);
        const designer = await designersCollection.findOne({ _id: designerId });
        
        if (!designer) {
            return res.status(404).json({
                success: false,
                message: "طراح مورد نظر یافت نشد"
            });
        }

        res.status(200).json({
            success: true,
            income: designer.income || 0
        });
    } catch (error) {
        console.error('Error viewing income:', error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت درآمد",
            error: error.message
        });
    }
};



exports.getDesignerIncome = async (req, res) => {
    try {
        // Authentication check
        if (!req.designer || !req.designer._id) {
            return res.status(401).json({
                success: false,
                message: "لطفا ابتدا وارد شوید",
                error: "AUTH_REQUIRED"
            });
        }

        const database = client.db('Dribble');
        const designsCollection = database.collection('designs');
        const buyersCollection = database.collection('buyers');

        // Get all designs for this designer
        const designs = await designsCollection.find({
            designer: req.designer._id
        }).toArray();

        if (!designs || designs.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    designer: {
                        id: req.designer._id,
                        name: req.designer.name,
                        email: req.designer.email
                    },
                    totalIncome: 0,
                    designs: []
                }
            });
        }

        // Process each design to get purchase information
        const designsWithPurchases = await Promise.all(designs.map(async (design) => {
            try {
                // Find buyers who have purchased this design
                const buyers = await buyersCollection.find({
                    'PurchasesList': {
                        $elemMatch: {
                            'DesignID': design._id.toString()
                        }
                    }
                }).toArray();

                // Calculate revenue for this design
                const designPrice = Number(design.price) || 0;
                const designRevenue = buyers.length * designPrice;

                // Format buyer information
                const formattedBuyers = buyers.map(buyer => {
                    const purchase = buyer.PurchasesList.find(p => 
                        p.DesignID === design._id.toString()
                    );
                    
                    return {
                        buyerId: buyer._id,
                        buyerName: buyer.name || buyer.Email,
                        purchaseDate: purchase?.ReleaseDate || null,
                        purchasePrice: purchase?.Price || design.price
                    };
                });

                return {
                    designId: design._id,
                    title: design.title,
                    price: designPrice,
                    purchases: buyers.length,
                    revenue: designRevenue,
                    buyers: formattedBuyers
                };
            } catch (error) {
                console.error(`Error processing design ${design._id}:`, error);
                return {
                    designId: design._id,
                    title: design.title,
                    price: Number(design.price) || 0,
                    purchases: 0,
                    revenue: 0,
                    buyers: [],
                    error: error.message
                };
            }
        }));

        // Calculate total income across all designs
        const totalIncome = designsWithPurchases.reduce((sum, design) => 
            sum + design.revenue, 0
        );

        // Send the response
        res.status(200).json({
            success: true,
            data: {
                designer: {
                    id: req.designer._id,
                    name: req.designer.name,
                    email: req.designer.email
                },
                totalIncome: totalIncome,
                designs: designsWithPurchases
            }
        });

    } catch (error) {
        console.error('Error in getDesignerIncome:', error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت اطلاعات درآمد",
            error: error.message
        });
    }
};
exports.editDesign = async (req, res) => {
    const db = getDB();
    const session = db.client.startSession();
    
    try {
        await session.withTransaction(async () => {
            const designId = new ObjectId(req.params.designId);
            const updates = req.body;
            
            const designsCollection = db.collection('designs');
            
            // Find the design
            const design = await designsCollection.findOne({ _id: designId }, { session });
            if (!design) {
                throw new Error('DESIGN_NOT_FOUND');
            }

            // Check for duplicate title
            if (updates.title && updates.title !== design.title) {
                const existingDesign = await designsCollection.findOne({
                    title: updates.title,
                    designer: new ObjectId(design.designer),
                    _id: { $ne: designId }
                }, { session });

                if (existingDesign) {
                    throw new Error('DUPLICATE_TITLE');
                }
            }

            // Update the design
            const updatedDesign = await designsCollection.findOneAndUpdate(
                { _id: designId },
                { $set: updates },
                { 
                    session,
                    returnDocument: 'after'
                }
            );

            res.status(200).json({
                success: true,
                message: "طرح با موفقیت بروزرسانی شد",
                design: updatedDesign.value
            });
        });
    } catch (error) {
        console.error('Error editing design:', error);
        
        if (error.message === 'DESIGN_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: "طرح مورد نظر یافت نشد"
            });
        }
        
        if (error.message === 'DUPLICATE_TITLE') {
            return res.status(400).json({
                success: false,
                message: "طرحی با این عنوان قبلاً ثبت شده است",
                error: "DUPLICATE_TITLE"
            });
        }

        res.status(500).json({
            success: false,
            message: "خطا در بروزرسانی طرح",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};

// Delete design
exports.deleteDesign = async (req, res) => {
    const db = getDB();
    const session = db.client.startSession();
    
    try {
        await session.withTransaction(async () => {
            const designId = new ObjectId(req.params.designId);
            
            const designsCollection = db.collection('designs');
            const designersCollection = db.collection('designers');
            
            // Find the design
            const design = await designsCollection.findOne({ _id: designId }, { session });
            if (!design) {
                throw new Error('DESIGN_NOT_FOUND');
            }

            // Check for purchases
            if (design.purchases?.length > 0) {
                throw new Error('HAS_PURCHASES');
            }

            // Delete the design
            await designsCollection.deleteOne({ _id: designId }, { session });

            // Remove from designer's designs array
            await designersCollection.updateOne(
                { _id: new ObjectId(design.designer) },
                { $pull: { designs: designId } },
                { session }
            );

            res.status(200).json({
                success: true,
                message: "طرح با موفقیت حذف شد"
            });
        });
    } catch (error) {
        console.error('Error deleting design:', error);
        
        if (error.message === 'DESIGN_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: "طرح مورد نظر یافت نشد"
            });
        }
        
        if (error.message === 'HAS_PURCHASES') {
            return res.status(400).json({
                success: false,
                message: "این طرح دارای خرید است و قابل حذف نمی‌باشد"
            });
        }

        res.status(500).json({
            success: false,
            message: "خطا در حذف طرح",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};

// Get single design
exports.getDesign = async (req, res) => {
    try {
        const db = getDB();
        const designsCollection = db.collection('designs');
        
        const designId = new ObjectId(req.params.designId);
        const design = await designsCollection.findOne({ _id: designId });
        
        if (!design) {
            return res.status(404).json({
                success: false,
                message: 'طرح مورد نظر یافت نشد'
            });
        }

        res.status(200).json({
            success: true,
            design
        });
    } catch (error) {
        console.error('Error getting design:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت اطلاعات طرح',
            error: error.message
        });
    }
};