// getNumLogicalProcessors gets the number of logical processors for optimally offloading to workers
export async function getNumLogicalProcessors() {
    try {
        // Fetch the number logical processors available
        if (navigator && 'hardwareConcurrency' in navigator) {
            const numLogicalProcessors = navigator.hardwareConcurrency || 1;
            return numLogicalProcessors;
        } else {
            return 1; // Default value if Navigator or hardwareConcurrency not available
        }
    } catch (error) {
        return 1; // Default value if an error occurs
    }
}
