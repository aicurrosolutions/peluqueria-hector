// Activación inmediata: sin skipWaiting el SW espera a que todas las
// pestañas se cierren antes de activarse, lo que impide recibir push
// en la sesión actual.
self.addEventListener("install", function (event) {
  self.skipWaiting();
});

// clients.claim() hace que el SW tome el control de las pestañas abiertas
// sin necesidad de recargar. Crítico para que showNotification funcione.
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Nueva cita";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo.png",
    badge: "/logo.png",
    data: { url: data.url || "/admin/dashboard" },
    vibrate: [100, 50, 100],
    // tag agrupa notificaciones del mismo tipo; renotify fuerza vibración
    // aunque ya haya una notificación con el mismo tag
    tag: "nueva-cita",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if (client.url.includes("/admin") && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(
            event.notification.data?.url || "/admin/dashboard"
          );
        }
      })
  );
});
