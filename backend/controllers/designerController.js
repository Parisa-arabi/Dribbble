const { getDB } = require('../config/db');
const { client } = require('../config/db'); 
const { ObjectId } = require('mongodb');
exports.addDesign = async (req, res) => {
    const db = getDB();
    const session = db.client.startSession();
    
    
    try {
        await session.withTransaction(async () => {
            const designerId = req.designer._id;
            const designerEmail = req.designer.email;
            const { title, price, category, purchase = false, description } = req.body;
            const imageUrls = req.files.map(file => `/uploads/designs/${file.filename}`);
            const designsCollection = db.collection('designs');
            const designersCollection = db.collection('designers');            
            const existingDesign = await designsCollection.findOne({
                title: title,
            }, { session });

            if (existingDesign) {
                throw new Error('DUPLICATE_TITLE');
            }

        
            const designDoc = {
                title,
                price: Number(price),
                category,
                designer: new ObjectId(designerId),
                purchase,
                description,
                designerEmail,
                images: imageUrls, 
                createdAt: new Date()
            };


            const result = await designsCollection.insertOne(designDoc, { session });
            
            
            await designersCollection.updateOne(
                { _id: new ObjectId(designerId) },
                { $push: { designs: result.insertedId } },
                { session }
            );

            
            res.status(201).json({
                success: true,
                message: "design added successfully",
                design: {
                    ...designDoc,
                    _id: result.insertedId
                }
            });
        });

    } catch (error) {
        console.error('Error adding design:', error);
        
        
        if (error.message === 'DUPLICATE_TITLE') {
            return res.status(400).json({
                success: false,
                message: "this design has been added before",
                error: "DUPLICATE_TITLE"
            });
        }

        
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
        const buyersCollection = db.collection('buyers');

        const designerObjectId = typeof designerId === 'string' ? new ObjectId(designerId) : designerId;
        const designs = await designsCollection.find({ designer: designerObjectId }).toArray();
        
        if (!designs || designs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No designs found for this designer",
                designs: []
            });
        }

        const transformedDesigns = await Promise.all(designs.map(async (design) => {
            // Check if this design exists in any buyer's PurchasesList
            const purchaseExists = await buyersCollection.findOne({
                'PurchasesList': {
                    $elemMatch: {
                        'DesignID': design._id.toString()
                    }
                }
            });

            // If purchase exists, update the design document in the database
            if (purchaseExists) {
                await designsCollection.updateOne(
                    { _id: design._id },
                    { $set: { purchase: true } }
                );
            }

            return {
                ...design,
                purchased: purchaseExists !== null,
                images: (design.images || []).map(imagePath => 
                    imagePath.startsWith('/') ? imagePath : `/${imagePath}`
                )
            };
        }));

        return res.status(200).json({
            success: true,
            count: transformedDesigns.length,
            designs: transformedDesigns
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
                message: "designer not found"
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
            message: "error in finding income",
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
                message: "please enter first",
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


        const designsWithPurchases = await Promise.all(designs.map(async (design) => {
            try {
                
                const buyers = await buyersCollection.find({
                    'PurchasesList': {
                        $elemMatch: {
                            'DesignID': design._id.toString()
                        }
                    }
                }).toArray();

                
                const designPrice = Number(design.price) || 0;
                const designRevenue = buyers.length * designPrice;

                
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

        
        const totalIncome = designsWithPurchases.reduce((sum, design) => 
            sum + design.revenue, 0
        );

        
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
            
            
            const design = await designsCollection.findOne({ _id: designId }, { session });
            if (!design) {
                throw new Error('DESIGN_NOT_FOUND');
            }

            
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
                message: "design edited",
                design: updatedDesign.value
            });
        });
    } catch (error) {
        console.error('Error editing design:', error);
        
        if (error.message === 'DESIGN_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: "design not found"
            });
        }
        
        if (error.message === 'DUPLICATE_TITLE') {
            return res.status(400).json({
                success: false,
                message: "duplicated design",
                error: "DUPLICATE_TITLE"
            });
        }

        res.status(500).json({
            success: false,
            message: "error while updating design",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};

exports.deleteDesign = async (req, res) => {
    const db = getDB();
    const session = db.client.startSession();
    
    try {
        await session.withTransaction(async () => {
            const designId = new ObjectId(req.params.designId);
            
            const designsCollection = db.collection('designs');
            const designersCollection = db.collection('designers');
            
           
            const design = await designsCollection.findOne({ _id: designId }, { session });
            if (!design) {
                throw new Error('DESIGN_NOT_FOUND');
            }

            
            if (design.purchases?.length > 0) {
                throw new Error('HAS_PURCHASES');
            }

            
            await designsCollection.deleteOne({ _id: designId }, { session });

           
            await designersCollection.updateOne(
                { _id: new ObjectId(design.designer) },
                { $pull: { designs: designId } },
                { session }
            );

            res.status(200).json({
                success: true,
                message: "design deleted"
            });
        });
    } catch (error) {
        console.error('Error deleting design:', error);
        
        if (error.message === 'DESIGN_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: "design not found"
            });
        }
        
        if (error.message === 'HAS_PURCHASES') {
            return res.status(400).json({
                success: false,
                message: "this design is purchased you can not delete it"
            });
        }

        res.status(500).json({
            success: false,
            message: "error while deleting the design",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};


exports.getDesign = async (req, res) => {
    try {
        const db = getDB();
        const designsCollection = db.collection('designs');
        
        const designId = new ObjectId(req.params.designId);
        const design = await designsCollection.findOne({ _id: designId });
        
        if (!design) {
            return res.status(404).json({
                success: false,
                message: "design not found"
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
            message: "error while loading design",
            error: error.message
        });
    }
};