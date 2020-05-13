/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js');

self.addEventListener('push', function(e) {
  var body;

  if (e.data) {
    body = e.data.text();
  } else {
    body = 'Push message no payload';
  }

  var options = {
    body: body,
    icon:'images/profile/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  e.waitUntil(
    self.registration.showNotification('TiNotifications', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});


// curl "https://android.googleapis.com/gcm/send/fNBa0QhdJKw:APA91bFf_Ywj20An01jN6QGIq71KYEhKUvbdb6xelW5qnVqtIG-o63xceX328Ui9mDNHCCPPjXYzKJsu5RZA9L1OPz9qyP_0z0bg3Nzq9xRSlx0a1_R5U_32hwpXY0_0d_HLouyGhcKY" --request POST --header "TTL: 60" --header "Content-Length: 0" \
// --header "Authorization: key=AAAAkM3LSgk:APA91bFpggCzguLjh6TCHtM5RoiilWFqeItXSHOf7MFUgtu95U4c2z8yWWD7ljECwtCHpCmgHBmM6EHvVKuufDvRcp4YaLhAMQ4K-Ob382vk2JC7kNTWIoUt1Pob35oTf8XX90wAqxYU"


if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`); 
  workbox.precaching.precacheAndRoute([]);

  // const showNotification = () => {
  //   self.registration.showNotification('Background sync success!', {
  //     body: '🎉`🎉`🎉`'
  //   });
  // };

  // const bgSyncPlugin = new workbox.backgroundSync.Plugin(
  //   'dashboardr-queue',
  //   {
  //     callbacks: {
  //       queueDidReplay: showNotification
  //       // other types of callbacks could go here
  //     }
  //   }
  // );

  // const networkWithBackgroundSync = new workbox.strategies.NetworkOnly({
  //   plugins: [bgSyncPlugin],
  // });

  // workbox.routing.registerRoute(
  //   /\/api\/add/,
  //   networkWithBackgroundSync,
  //   'POST'
  // );

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}