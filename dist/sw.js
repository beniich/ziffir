/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-caf3a6a6'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "index.html",
    "revision": "5969981f01c25f714cf1b3fd2f6f9d1f"
  }, {
    "url": "assets/Vault-39SpNxaf.js",
    "revision": null
  }, {
    "url": "assets/utensils-BVMnX-G-.js",
    "revision": null
  }, {
    "url": "assets/users-DU5skUjy.js",
    "revision": null
  }, {
    "url": "assets/Users-9yyDyIMY.js",
    "revision": null
  }, {
    "url": "assets/useQuery-C68DJx7A.js",
    "revision": null
  }, {
    "url": "assets/useMutation-DY0ipuZf.js",
    "revision": null
  }, {
    "url": "assets/triangle-alert-Aps4FM79.js",
    "revision": null
  }, {
    "url": "assets/trending-up-BqCHOrUs.js",
    "revision": null
  }, {
    "url": "assets/Staff-CI8BzbgD.js",
    "revision": null
  }, {
    "url": "assets/sparkles-CNETm8xN.js",
    "revision": null
  }, {
    "url": "assets/Select-D_b_JdKL.js",
    "revision": null
  }, {
    "url": "assets/SecurityPage-C8Fb90h8.js",
    "revision": null
  }, {
    "url": "assets/RoomService-CgYZuB97.js",
    "revision": null
  }, {
    "url": "assets/RegisterPage-CFrcPuWr.js",
    "revision": null
  }, {
    "url": "assets/react-dom-q7UnUfP_.js",
    "revision": null
  }, {
    "url": "assets/Pricing-OHQTsZgX.js",
    "revision": null
  }, {
    "url": "assets/plus-Tyzpha6F.js",
    "revision": null
  }, {
    "url": "assets/MyOrders-CUa__UTW.js",
    "revision": null
  }, {
    "url": "assets/MyInvoices-B0NlC3H3.js",
    "revision": null
  }, {
    "url": "assets/mail-wLiTADNk.js",
    "revision": null
  }, {
    "url": "assets/LoginPage-DUxPGWEq.js",
    "revision": null
  }, {
    "url": "assets/lock-ChCHggVO.js",
    "revision": null
  }, {
    "url": "assets/loader-circle-S5LCWVcM.js",
    "revision": null
  }, {
    "url": "assets/jsx-dev-runtime-NrSUQw_W.js",
    "revision": null
  }, {
    "url": "assets/Input-KEDA-gEV.js",
    "revision": null
  }, {
    "url": "assets/index-BziGIp8Y.css",
    "revision": null
  }, {
    "url": "assets/index-BSm4e2gm.js",
    "revision": null
  }, {
    "url": "assets/Hotels-DUvPvFZZ.js",
    "revision": null
  }, {
    "url": "assets/HotelDashboard-DbwyGlqz.js",
    "revision": null
  }, {
    "url": "assets/HeroPage-DskjAiyl.js",
    "revision": null
  }, {
    "url": "assets/globe-KPLs0OFE.js",
    "revision": null
  }, {
    "url": "assets/GlobalAnalytics-BfSsVea5.js",
    "revision": null
  }, {
    "url": "assets/ForbiddenPage-DYHJ582p.js",
    "revision": null
  }, {
    "url": "assets/eye-off-Dy4xD_QJ.js",
    "revision": null
  }, {
    "url": "assets/EmptyState-Be48AbRL.js",
    "revision": null
  }, {
    "url": "assets/createLucideIcon-BOCmksf6.js",
    "revision": null
  }, {
    "url": "assets/Controls-Erp7B6O2.js",
    "revision": null
  }, {
    "url": "assets/ClientDashboard-DQ4zkKxX.js",
    "revision": null
  }, {
    "url": "assets/circle-check-L4ubWvhF.js",
    "revision": null
  }, {
    "url": "assets/Card-Cs72Zvmj.js",
    "revision": null
  }, {
    "url": "assets/building-2-KCnNT0tA.js",
    "revision": null
  }, {
    "url": "assets/Billing-CQpXceMV.js",
    "revision": null
  }, {
    "url": "assets/Analytics-CwI6qIbF.js",
    "revision": null
  }, {
    "url": "assets/AdminDashboard-CWjaUqRN.js",
    "revision": null
  }, {
    "url": "assets/Activities-D4631m5z.js",
    "revision": null
  }, {
    "url": "assets/AboutPage-BhQVNvUp.js",
    "revision": null
  }, {
    "url": "manifest.webmanifest",
    "revision": "d7332ed4c744b346fc58f5c1066de400"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/\/api\/(audits|room-service|ledger|staff)/, new workbox.NetworkFirst({
    "cacheName": "api-cache",
    "networkTimeoutSeconds": 5,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 300
    })]
  }), 'GET');

}));
