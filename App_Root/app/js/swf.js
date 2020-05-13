if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function(reg) {
    console.log('Service Worker Registered!, now checking subs', reg);
  }).catch(function(err) {
    console.error('Service Worker registration failed: ', err);
  });
}
