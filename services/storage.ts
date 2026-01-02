import { Profile, ServerConfig } from "../types";

const BASE_URL = 'https://api.jsonbin.io/v3/b';

export const createRemoteBin = async (profile: Profile, apiKey: string): Promise<string> => {
    try {
        const response = await fetch(`${BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey,
                'X-Bin-Name': 'Guns.lol Clone Profile'
            },
            body: JSON.stringify(profile)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Creation failed: ${err.message || response.statusText}`);
        }

        const data = await response.json();
        return data.metadata.id;
    } catch (error) {
        console.error("Error creating remote bin:", error);
        throw error;
    }
};

export const saveProfileRemote = async (profile: Profile, config: ServerConfig): Promise<boolean> => {
    try {
        const response = await fetch(`${BASE_URL}/${config.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': config.apiKey
            },
            body: JSON.stringify(profile)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Save failed: ${err.message || response.statusText}`);
        }
        
        return true;
    } catch (error) {
        console.error("Failed to save to remote server:", error);
        throw error;
    }
};

export const loadProfileRemote = async (config: ServerConfig): Promise<Profile | null> => {
    try {
        const response = await fetch(`${BASE_URL}/${config.binId}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': config.apiKey
            }
        });

        if (!response.ok) {
             console.warn(`Load failed: ${response.statusText}`);
             return null;
        }

        const data = await response.json();
        // JSONBin v3 returns data wrapped in a "record" object
        return data.record as Profile;
    } catch (error) {
        console.error("Failed to load from remote server:", error);
        return null;
    }
};
