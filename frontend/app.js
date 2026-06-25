document.addEventListener('DOMContentLoaded', () => {
    // API endpoints (routed through Nginx proxy in production/Docker)
    const HELLO_API = '/api/hello';
    const HEALTH_API = '/api/health';

    // DOM Elements
    const statusBadge = document.getElementById('backend-status-badge');
    const statusText = document.getElementById('backend-status-text');
    const helloMessage = document.getElementById('hello-message');
    const timestampDisplay = document.getElementById('timestamp-display');
    const fetchBtn = document.getElementById('fetch-btn');
    const latencyDisplay = document.getElementById('latency-display');
    const responseStatus = document.getElementById('response-status');
    const jsonPayload = document.getElementById('json-payload');
    const requestUrlElement = document.getElementById('request-url');

    // State Variables
    let isFetching = false;

    // Set connection status badge helper
    function setStatus(state) {
        // Reset classes
        statusBadge.className = 'status-badge';
        
        if (state === 'checking') {
            statusBadge.classList.add('checking');
            statusText.textContent = 'Checking Grid...';
        } else if (state === 'online') {
            statusBadge.classList.add('online');
            statusText.textContent = 'Backend Online';
        } else if (state === 'offline') {
            statusBadge.classList.add('offline');
            statusText.textContent = 'Grid Offline';
        }
    }

    // Helper to format timestamps beautifully
    function formatTime(isoString) {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString() + ' (UTC: ' + date.toISOString().slice(11, 19) + ')';
        } catch (e) {
            return isoString;
        }
    }

    // Fetch message from backend Express server
    async function fetchHelloWorld() {
        if (isFetching) return;
        
        isFetching = true;
        fetchBtn.disabled = true;
        fetchBtn.classList.add('loading');
        
        requestUrlElement.textContent = `GET ${HELLO_API}`;
        responseStatus.textContent = 'Pending...';
        
        const startTime = performance.now();
        
        try {
            const response = await fetch(HELLO_API);
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            
            // Log response status code
            responseStatus.textContent = `${response.status} ${response.statusText}`;
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update UI elements with retrieved data
            helloMessage.textContent = data.message || "No message received";
            helloMessage.style.color = 'var(--text-main)';
            timestampDisplay.textContent = `Server Time: ${formatTime(data.timestamp)}`;
            latencyDisplay.textContent = `${latency} ms`;
            latencyDisplay.style.color = 'var(--primary)';
            
            // Syntax highlight JSON output
            jsonPayload.textContent = JSON.stringify(data, null, 2);
            
            // Since request succeeded, the backend is up
            setStatus('online');
            
        } catch (error) {
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);
            
            console.error('Fetch operation failed:', error);
            
            responseStatus.textContent = 'Failed';
            helloMessage.textContent = 'Could not establish connection to the grid.';
            helloMessage.style.color = 'var(--status-offline)';
            timestampDisplay.textContent = 'Please check backend logs or Docker status.';
            latencyDisplay.textContent = `${latency} ms`;
            latencyDisplay.style.color = 'var(--status-offline)';
            
            jsonPayload.textContent = JSON.stringify({
                error: "Network Error / Service Unavailable",
                message: error.message,
                tip: "Make sure both frontend and backend Docker containers are running and in the same network."
            }, null, 2);
            
            setStatus('offline');
        } finally {
            isFetching = false;
            fetchBtn.disabled = false;
            fetchBtn.classList.remove('loading');
        }
    }

    // Verify system connection periodically
    async function checkSystemHealth() {
        try {
            const response = await fetch(HEALTH_API);
            if (response.ok) {
                setStatus('online');
            } else {
                setStatus('offline');
            }
        } catch (e) {
            setStatus('offline');
        }
    }

    // Event listener for refresh button
    fetchBtn.addEventListener('click', fetchHelloWorld);

    // Initial triggers
    setStatus('checking');
    fetchHelloWorld();

    // Check health every 15 seconds to keep badge current
    setInterval(checkSystemHealth, 15000);
});
