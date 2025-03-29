import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { requireApiKey } from '$lib/server/auth';
import { connectDB } from '$lib/server/db';
import { deleteOldContainerChecks, MAX_DATA_AGE_DAYS } from '$lib/server/cleanup';

export const POST: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;
    
    console.log('🧹 CLEANUP API: Manually triggered cleanup via dedicated endpoint');
    
    try {
        const dbConnected = await connectDB();
        if (!dbConnected) {
            console.error('❌ CLEANUP API FAILED: Could not connect to database');
            return json({ error: 'Failed to connect to database' }, { status: 500 });
        }
        
        const deletedCount = await deleteOldContainerChecks();
        console.log(`✅ CLEANUP API COMPLETED: Cleanup finished successfully, removed ${deletedCount} records`);
        
        return json({ 
            success: true, 
            message: 'Container checks older than 30 days deleted successfully',
            details: {
                recordsDeleted: deletedCount,
                timestamp: new Date().toISOString(),
                maxAgeInDays: MAX_DATA_AGE_DAYS
            }
        });
    } catch (error) {
        console.error('❌ CLEANUP API ERROR:', error);
        return json({ 
            error: 'Failed to clean up old data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};

// Fallback to POST via GET with action parameter
export const GET: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;
    
    const url = new URL(event.request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'run') {
        console.log('🧹 CLEANUP API: Manually triggered cleanup via GET with action=run');
        
        try {
            const dbConnected = await connectDB();
            if (!dbConnected) {
                console.error('❌ CLEANUP API FAILED: Could not connect to database');
                return json({ error: 'Failed to connect to database' }, { status: 500 });
            }
            
            const deletedCount = await deleteOldContainerChecks();
            console.log(`✅ CLEANUP API COMPLETED: Cleanup finished successfully, removed ${deletedCount} records`);
            
            return json({ 
                success: true, 
                message: 'Container checks older than 30 days deleted successfully',
                details: {
                    recordsDeleted: deletedCount,
                    timestamp: new Date().toISOString(),
                    maxAgeInDays: MAX_DATA_AGE_DAYS
                }
            });
        } catch (error) {
            console.error('❌ CLEANUP API ERROR:', error);
            return json({ 
                error: 'Failed to clean up old data',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    }
    
    return json({
        message: 'Cleanup API endpoint',
        usage: 'POST to this endpoint or GET with ?action=run to trigger database cleanup',
        maxAgeInDays: MAX_DATA_AGE_DAYS
    });
}; 