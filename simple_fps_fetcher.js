// SIMPLE FPS FETCHER - Slow & Stable
// Taruh ini di kontrol.js, ganti function startFPSCounter()

function startFPSCounter() {
    if (fpsUpdateInterval) {
        clearInterval(fpsUpdateInterval);
    }
    
    console.log('🎬 Starting SIMPLE FPS counter...');
    
    // Function untuk fetch FPS
    async function fetchAndDisplayFPS() {
        const fpsElement = document.getElementById('camera-fps');
        if (!fpsElement || !cameraStreamActive) return;
        
        try {
            console.log(`📡 Fetching FPS (simple mode)...`);
            
            // Simple fetch tanpa timeout - biarkan browser handle
            const response = await fetch(`http://${ESPCAM_IP}/status`, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.fps !== undefined) {
                    const fps = Math.round(data.fps);
                    fpsElement.textContent = fps > 0 ? fps : '--';
                    console.log(`✅ FPS: ${fps}`);
                } else {
                    console.warn('⚠️ No FPS in response');
                }
            } else {
                console.error(`❌ HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            // Don't change display on error - keep last value
        }
    }
    
    // Fetch pertama kali
    fetchAndDisplayFPS();
    
    // Lalu setiap 5 detik (sangat lambat, tapi stabil!)
    fpsUpdateInterval = setInterval(fetchAndDisplayFPS, 5000);
    
    console.log('✅ Simple FPS counter started (every 5 seconds)');
}