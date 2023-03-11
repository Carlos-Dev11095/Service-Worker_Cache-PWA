
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registrado correctamente:', registration);
      })
      .catch(function(err) {
        console.log('Error al registrar el Service Worker:', err);
      });
  }
  