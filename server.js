const fs = require('fs');
const path = require('path');

// Load all platform handlers dynamically
const platforms = {};
const platformDir = path.join(__dirname, 'platforms');

fs.readdirSync(platformDir).forEach((file) => {
    if (file.endsWith('.js')) {
        const { platformName, post } = require(path.join(platformDir, file));
        platforms[platformName] = post;
    }
});

// Function to post to selected platforms
async function postToPlatforms(selectedPlatforms, message, mediaBuffers) {
    const results = [];

    for (const platform of selectedPlatforms) {
        if (platforms[platform]) {
            try {
                await platforms[platform](message, mediaBuffers);
                results.push({ platform, status: 'success' });
            } catch (error) {
                results.push({ platform, status: 'failure', error: error.message });
            }
        } else {
            results.push({ platform, status: 'unsupported' });
        }
    }

    return results;
}

// Example usage
(async () => {
    const selectedPlatforms = ['twitter', 'mastodon'];
    const message = 'Hello, world!';
    const mediaBuffers = []; // Add your file buffers here

    const results = await postToPlatforms(selectedPlatforms, message, mediaBuffers);
    console.log(results);
})();
