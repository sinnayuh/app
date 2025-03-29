import mongoose from 'mongoose';
import { env } from '$env/dynamic/private';

let isConnected = false;

/**
 * Connect to MongoDB database
 * @returns Promise<boolean> True if connected successfully
 */
export async function connectDB(): Promise<boolean> {
    if (!env.MONGODB_URI) {
        console.error('MONGODB_URI not found');
        return false;
    }

    if (isConnected) return true;

    try {
        await mongoose.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });
        console.log('MongoDB connected successfully');
        isConnected = true;
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        return false;
    }
} 