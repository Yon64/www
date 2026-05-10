/**
 * offline_socket.js
 * A Socket.IO shim using BroadcastChannel and localStorage for serverless communication.
 * This allows control.html and display.html to talk to each other on the same machine.
 */
(function() {
    const channel = new BroadcastChannel('canoe_broadcast');

    class Socket {
        constructor() {
            this.callbacks = {};
            
            // Listen for messages from other tabs
            channel.onmessage = (event) => {
                const { type, data } = event.data;
                console.log(`[OfflineSocket] Received: ${type}`, data);
                if (this.callbacks[type]) {
                    this.callbacks[type].forEach(cb => cb(data));
                }
            };
        }

        on(type, callback) {
            if (!this.callbacks[type]) this.callbacks[type] = [];
            this.callbacks[type].push(callback);
            
            // For persistence: load initial state from localStorage if it exists
            const savedData = localStorage.getItem('canoe_' + type);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    // Standard socket.io behavior: initial data often comes via 'connect' or similar,
                    // but here we trigger the dedicated listener immediately to simulate server state.
                    setTimeout(() => callback(parsedData), 0);
                } catch (e) {
                    console.error(`[OfflineSocket] Error parsing localStorage for ${type}`, e);
                }
            }
            
            // Special case for 'connect' event
            if (type === 'connect') {
                setTimeout(() => callback(), 0);
            }
        }

        emit(type, data) {
            console.log(`[OfflineSocket] Emitting: ${type}`, data);
            
            // Save to localStorage for persistence
            localStorage.setItem('canoe_' + type, JSON.stringify(data));
            
            // Broadcast to other tabs
            channel.postMessage({ type, data });
            
            // In the original Socket.IO setup, the server broadcasts back to the sender too
            // so we trigger local callbacks to maintain consistency.
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(cb => cb(data));
            }
        }
    }

    const socketInstance = new Socket();
    
    // Global io() function to match Socket.IO client API
    window.io = function() {
        return socketInstance;
    };
})();
