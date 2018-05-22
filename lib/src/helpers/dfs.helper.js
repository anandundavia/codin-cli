const fs = require('fs');
const path = require('path');

let output = [];

const dfs = (dir, config, depth) => {
    if (depth >= config.maxDepth) return;
    const matched = config.exclude.filter(aDirectoryToExclude => dir.includes(aDirectoryToExclude));
    if (matched.length > 0) return;
    if (fs.lstatSync(dir).isDirectory()) {
        fs.readdirSync(dir).map(child => (child.startsWith('.') ? undefined : dfs(path.join(dir, child), config, depth + 1)));
    } else if (dir.match(config.regex)) {
        // Regex that matches all the files ending with .js
        output.push(dir);
    }
};

const merge = (config) => {
    const configToReturn = {};
    configToReturn.regex = config.regex || /[^.spec][^.d]\.js?$/;
    // By default, add node_modules to excldue
    configToReturn.exclude = config.exclude || ['node_modules'];
    configToReturn.maxDepth = config.maxDepth || 8;

    if (!Array.isArray(configToReturn.exclude)) {
        configToReturn.exclude = [configToReturn.exclude];
    }
    if (!configToReturn.exclude.includes('node_modules')) {
        configToReturn.exclude.push('node_modules');
    }
    if (!configToReturn.exclude.includes('.git')) {
        configToReturn.exclude.push('.git');
    }
    return configToReturn;
};

const execute = (cwd, configs) => {
    try {
        const config = merge(configs);
        output = [];
        dfs(cwd, config, 0);
        return output;
    } catch (e) {
        return [];
    }
};

module.exports = { execute };
