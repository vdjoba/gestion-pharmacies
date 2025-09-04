import mongoose, { Document } from 'mongoose';
export interface IMedicament extends Document {
    name: string;
    quantity: number;
    price: number;
    category: string;
    therapeuticClass: string;
    healthSystemClass: string;
    form: string;
    imageUrl: string;
    alternatives: mongoose.Types.ObjectId[];
}
declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File;
        }
    }
}
//# sourceMappingURL=app.d.ts.map