const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');
const { log } = require('npmlog');

function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null;
    }
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName);
    return axios.get(npmInfoUrl).then(response => {
        if (response.status === 200) {
            return response.data;
        }
        return null;
    }).catch(err => {
        throw Promise.reject(err);
    })
}

function getDefaultRegistry(isOriginal = true) {
    return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org/'
}

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}

function getSemverVersions(baseVersion, versions) {
    const lastVersions = versions
        .filter(version => { return semver.satisfies(version, `^${baseVersion}`); })
        .sort((a, b) => { return semver.gt(a, b) });
    return lastVersions;
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry);
    const newVersions = getSemverVersions(baseVersion, versions);
    if (newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
}

async function getNpmLatestVersion(npmName, registry) {
    const versions = await getNpmVersions(npmName, registry);
    // TODO semver不生效
    if (versions) {
        return versions.sort((a, b) => semver.gt(a, b))[versions.length - 1]
    }
    return null;
}

module.exports = {
    getNpmInfo,
    getNpmSemverVersion,
    getDefaultRegistry,
    getNpmLatestVersion
};
