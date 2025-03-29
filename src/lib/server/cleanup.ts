import mongoose from 'mongoose';
import { Container } from '$lib/db/uptimeSchema';

// Define a constant for the maximum age of data to keep (30 days)
export const MAX_DATA_AGE_DAYS = 30;

/**
 * Delete container check records that are older than MAX_DATA_AGE_DAYS
 * @returns The total number of records deleted
 */
export async function deleteOldContainerChecks(): Promise<number> {
    console.log(`🗑️ Starting cleanup of container data older than ${MAX_DATA_AGE_DAYS} days`);
    let totalDeleted = 0;
    
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - MAX_DATA_AGE_DAYS);
        console.log(`🗓️ Cutoff date for deletion: ${cutoffDate.toISOString()}`);
        
        // Get all containers
        const containers = await Container.find();
        console.log(`📊 Found ${containers.length} containers to process`);
        
        // For each container, filter out old checks
        for (const container of containers) {
            const oldChecksCount = container.checks.filter(
                (check: any) => check.timestamp < cutoffDate
            ).length;
            
            if (oldChecksCount > 0) {
                console.log(`📦 Container ${container.containerId}: Found ${oldChecksCount} checks to delete`);
                
                // Use $pull to remove checks older than the cutoff date
                const result = await Container.updateOne(
                    { _id: container._id },
                    {
                        $pull: {
                            checks: {
                                timestamp: { $lt: cutoffDate }
                            }
                        }
                    }
                );
                
                console.log(`✅ Container ${container.containerId}: Deleted ${oldChecksCount} old checks (MongoDB response: ${JSON.stringify(result)})`);
                totalDeleted += oldChecksCount;
            } else {
                console.log(`✓ Container ${container.containerId}: No old checks to delete`);
            }
        }
        
        console.log(`🎉 Cleanup completed: Deleted ${totalDeleted} old checks in total`);
    } catch (error) {
        console.error('❌ Error deleting old checks:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        throw error; // Re-throw to allow proper handling by caller
    }
    
    return totalDeleted;
}

/**
 * Schedules periodic cleanup based on probability
 * Should be called regularly (e.g., every minute) and will 
 * run cleanup approximately once per dayCount days
 * @param dayCount Number of days between cleanup runs (default: 1)
 * @returns Boolean indicating if cleanup was run
 */
export async function runScheduledCleanupIfNeeded(dayCount = 1): Promise<boolean> {
    // Calculate probability based on calls per day
    // (e.g., if called every minute, 1440 calls per day)
    const callsPerDay = 24 * 60; // 1440 calls for minute interval
    const probability = 1 / (callsPerDay * dayCount);
    
    // Only run with calculated probability to achieve approximately one run per dayCount
    if (Math.random() < probability) {
        console.log(`⏰ SCHEDULED CLEANUP: Running automated cleanup (runs ~ every ${dayCount} day(s))`);
        try {
            const deletedCount = await deleteOldContainerChecks();
            console.log(`⏰ SCHEDULED CLEANUP COMPLETED: Removed ${deletedCount} old records`);
            return true;
        } catch (cleanupError) {
            console.error('⏰ SCHEDULED CLEANUP FAILED:', cleanupError);
            return false;
        }
    }
    
    return false;
} 