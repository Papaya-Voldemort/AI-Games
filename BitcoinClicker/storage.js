// Bitcoin Clicker - Storage Management

class Storage {
    static SAVE_KEY = 'bitcoinClicker_save';
    static AUTOSAVE_INTERVAL = 30000; // 30 seconds

    static save(gameState) {
        try {
            const saveData = {
                version: gameState.version || '1.0.0',
                timestamp: Date.now(),
                state: gameState
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }

    static load() {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            if (!saveData) return null;
            
            const parsed = JSON.parse(saveData);
            return parsed.state;
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    }

    static deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }

    static hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }

    static export() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        if (!saveData) return null;
        
        return btoa(saveData); // Base64 encode
    }

    static import(encodedData) {
        try {
            const decoded = atob(encodedData);
            const parsed = JSON.parse(decoded);
            
            // Validate the save data
            if (!parsed.version || !parsed.state) {
                throw new Error('Invalid save data');
            }
            
            localStorage.setItem(this.SAVE_KEY, decoded);
            return true;
        } catch (e) {
            console.error('Failed to import save:', e);
            return false;
        }
    }

    static calculateOfflineProgress(gameState) {
        const now = Date.now();
        const lastUpdate = gameState.lastUpdate || now;
        const timeDiff = (now - lastUpdate) / 1000; // Convert to seconds
        
        // Cap offline progress at 24 hours
        const offlineTime = Math.min(timeDiff, 86400);
        
        return offlineTime;
    }
}
