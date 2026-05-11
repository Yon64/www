/**
 * offline_socket.js
 * A Socket.IO shim using BroadcastChannel for same-browser communication
 * AND a PHP relay for cross-browser/OBS communication.
 */
(function() {
    const CHANNEL_NAME = 'canoe_broadcast';
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const RELAY_URL = 'relay.php';
    let lastState = {};
    const processedIds = new Set();
    const MAX_HISTORY = 100;

    function cleanupHistory() {
        if (processedIds.size > MAX_HISTORY) {
            const arr = Array.from(processedIds);
            processedIds.clear();
            arr.slice(-50).forEach(id => processedIds.add(id));
        }
    }

    class Socket {
        constructor() {
            this.callbacks = {};
            this.isPolling = false;

            // Listen for messages from other tabs in the same browser
            channel.onmessage = (event) => {
                const { type, data, uuid } = event.data;
                if (uuid && processedIds.has(uuid)) return;
                
                if (uuid) {
                    processedIds.add(uuid);
                    cleanupHistory();
                }

                console.log(`[OfflineSocket] Received (BC): ${type}`, data);
                if (this.callbacks[type]) {
                    this.callbacks[type].forEach(cb => cb(data));
                }
            };
        }

        on(type, callback) {
            if (!this.callbacks[type]) this.callbacks[type] = [];
            this.callbacks[type].push(callback);
            
            if (type === 'connect') {
                setTimeout(() => callback(), 0);
            }

            this.startPolling();
        }

        emit(type, data) {
            const uuid = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            processedIds.add(uuid);
            cleanupHistory();

            console.log(`[OfflineSocket] Emitting: ${type}`, data);
            
            // 1. Broadcast to other tabs
            channel.postMessage({ type, data, uuid });
            
            // 2. Trigger local callbacks
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(cb => cb(data));
            }

            // 3. Send to PHP relay for OBS
            fetch(RELAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data, uuid })
            }).catch(() => {});
        }

        startPolling() {
            if (this.isPolling) return;
            this.isPolling = true;

            let isFirstPoll = true;

            setInterval(() => {
                fetch(RELAY_URL + '?t=' + Date.now())
                    .then(r => r.json())
                    .then(state => {
                        for (const type in state) {
                            const entry = state[type];
                            const uuid = entry.uuid;

                            // On first poll, always apply state (for OBS which has empty processedIds)
                            // On subsequent polls, use UUID dedup
                            if (!isFirstPoll && uuid && processedIds.has(uuid)) {
                                if (!lastState[type] || lastState[type].ts < entry.ts) {
                                    lastState[type] = entry;
                                }
                                continue;
                            }

                            // If timestamp is newer (or first poll), trigger
                            if (isFirstPoll || !lastState[type] || lastState[type].ts < entry.ts) {
                                if (uuid) {
                                    processedIds.add(uuid);
                                    cleanupHistory();
                                }
                                
                                console.log(`[OfflineSocket] Received (Relay): ${type}`, entry.data);
                                if (this.callbacks[type]) {
                                    this.callbacks[type].forEach(cb => cb(entry.data));
                                }
                                lastState[type] = entry;
                                if (!isFirstPoll) {
                                    channel.postMessage({ type, data: entry.data, uuid });
                                }
                            }
                        }
                        isFirstPoll = false;
                    })
                    .catch(() => { isFirstPoll = false; });
            }, 1000);
        }
    }

    const socketInstance = new Socket();
    window.io = function() { return socketInstance; };
})();

