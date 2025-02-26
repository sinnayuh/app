import mongoose from 'mongoose';

const uptimeSchema = new mongoose.Schema({
    containerId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    isOnline: { type: Boolean, required: true }
});

const containerSchema = new mongoose.Schema({
    containerId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    checks: [uptimeSchema]
});

export const Container = mongoose.model('Container', containerSchema);
