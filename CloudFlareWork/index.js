'use strict'

/**
 * static files (404.html, sw.js, conf.js)
 */
const ASSET_URL = 'https://66042fc4f96ac40095e0e0fc--cerulean-selkie-8fe6c1.netlify.app/'
// 前缀，如果自定义路由为example.com/mc/*，将PREFIX改为 '/mc/'，注意，少一个杠都会错！
const PREFIX = '/'

/** @type {ResponseInit} */
const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
}

const launcherMetaMojangRegex = /^(https?:\/\/)?launchermeta\.mojang\.com(?:\/.*)?$/;  
const launcherMojangRegex = /^(https?:\/\/)?launcher\.mojang\.com(?:\/.*)?$/;  
const resourcesDownloadMinecraftRegex = /^(https?:\/\/)?resources\.download\.minecraft\.net(?:\/.*)?$/;  
const librariesMinecraftRegex = /^(https?:\/\/)?libraries\.minecraft\.net(?:\/.*)?$/;  
const filesMinecraftForgeRegex = /^(https?:\/\/)?files\.minecraftforge\.net(?:\/.*)?$/;  
const dlLiteloaderRegex = /^(https?:\/\/)?dl\.liteloader\.com(?:\/.*)?$/;  
const authlibInjectorYushiRegex = /^(https?:\/\/)?authlib-injector\.yushi\.moe(?:\/.*)?$/;  
const metaFabricmcRegex = /^(https?:\/\/)?meta\.fabricmc\.net(?:\/.*)?$/;  
const mavenFabricmcRegex = /^(https?:\/\/)?maven\.fabricmc\.net(?:\/.*)?$/;  
const mavenNeoforgedRegex = /^(https?:\/\/)?maven\.neoforged\.net(?:\/.*)?$/;  
const mavenQuiltmcRegex = /^(https?:\/\/)?maven\.quiltmc\.org(?:\/.*)?$/;  
const metaQuiltmcRegex = /^(https?:\/\/)?meta\.quiltmc\.org(?:\/.*)?$/;  
const pistonMetaMojangRegex = /^(https?:\/\/)?piston-meta\.mojang\.com(?:\/.*)?$/;  
const pistonDataMojangRegex = /^(https?:\/\/)?piston-data\.mojang\.com(?:\/.*)?$/;  
const dlAPISpongeRegex = /^(https?:\/\/)?dl-api\.spongepowered\.org(?:\/.*)?$/;  
const repoSpongeRegex = /^(https?:\/\/)?repo\.spongepowered\.org(?:\/.*)?$/;  
const mohistRegex = /^(https?:\/\/)?mohistmc\.com(?:\/.*)?$/;  
const pufferfishRegex = /^(https?:\/\/)?ci\.pufferfish\.host(?:\/.*)?$/;  


/**
 * @param {any} body
 * @param {number} status
 * @param {Object<string, string>} headers
 */
function makeRes(body, status = 200, headers = {}) {
    headers['access-control-allow-origin'] = '*'
    return new Response(body, {status, headers})
}


/**
 * @param {string} urlStr
 */
function newUrl(urlStr) {
    try {
        return new URL(urlStr)
    } catch (err) {
        return null
    }
}


addEventListener('fetch', e => {
    const ret = fetchHandler(e)
        .catch(err => makeRes('cfworker error:\n' + err.stack, 502))
    e.respondWith(ret)
})


function checkUrl(u) {
    for (let i of [launcherMetaMojangRegex, launcherMojangRegex, resourcesDownloadMinecraftRegex, librariesMinecraftRegex, filesMinecraftForgeRegex, dlLiteloaderRegex, authlibInjectorYushiRegex, metaFabricmcRegex, mavenFabricmcRegex, mavenNeoforgedRegex, mavenQuiltmcRegex, metaQuiltmcRegex,pistonMetaMojangRegex , pistonDataMojangRegex, dlAPISpongeRegex, repoSpongeRegex, mohistRegex, pufferfishRegex]) {
        if (u.search(i) === 0) {
            return true
        }
    }
    return false
}

/**
 * @param {FetchEvent} e
 */
async function fetchHandler(e) {
    const req = e.request
    const urlStr = req.url
    const urlObj = new URL(urlStr)
    let path = urlObj.searchParams.get('q')
    // cfworker 会把路径中的 `//` 合并成 `/`
    path = urlObj.href.slice(urlObj.origin.length + PREFIX.length).replace(/^\w+?:\/\/+/, '');  
    //定义正则表达式数组
    const regexArray = [launcherMetaMojangRegex, launcherMojangRegex, resourcesDownloadMinecraftRegex, librariesMinecraftRegex, filesMinecraftForgeRegex, dlLiteloaderRegex, authlibInjectorYushiRegex, metaFabricmcRegex, mavenFabricmcRegex, mavenNeoforgedRegex, mavenQuiltmcRegex, metaQuiltmcRegex,pistonMetaMojangRegex, pistonDataMojangRegex, dlAPISpongeRegex, repoSpongeRegex, mohistRegex, pufferfishRegex];  
      
    // 检查path是否与正则表达式数组中的任意一个匹配  
    let isMatched = regexArray.some(regex => regex.test(path));  
      
    // 输出结果  
    if (isMatched) {  
        return httpHandler(req, path);  
    } else {  
      return fetch(ASSET_URL)
    }
}


/**
 * @param {Request} req
 * @param {string} pathname
 */
function httpHandler(req, pathname) {
    const reqHdrRaw = req.headers

    // preflight
    if (req.method === 'OPTIONS' &&
        reqHdrRaw.has('access-control-request-headers')
    ) {
        return new Response(null, PREFLIGHT_INIT)
    }

    const reqHdrNew = new Headers(reqHdrRaw)

    let urlStr = pathname

    if (urlStr.search(/^https?:\/\//) !== 0) {
        urlStr = 'https://' + urlStr
    }
    const urlObj = newUrl(urlStr)

    /** @type {RequestInit} */
    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'manual',
        body: req.body
    }
    return proxy(urlObj, reqInit)
}


/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 */
async function proxy(urlObj, reqInit) {
    const res = await fetch(urlObj.href, reqInit)
    const resHdrOld = res.headers
    const resHdrNew = new Headers(resHdrOld)

    const status = res.status

    if (resHdrNew.has('location')) {
        let _location = resHdrNew.get('location')
        if (checkUrl(_location))
            resHdrNew.set('location', PREFIX + _location)
        else {
            reqInit.redirect = 'follow'
            return proxy(newUrl(_location), reqInit)
        }
    }
    resHdrNew.set('access-control-expose-headers', '*')
    resHdrNew.set('access-control-allow-origin', '*')

    resHdrNew.delete('content-security-policy')
    resHdrNew.delete('content-security-policy-report-only')
    resHdrNew.delete('clear-site-data')

    return new Response(res.body, {
        status,
        headers: resHdrNew,
    })
}
