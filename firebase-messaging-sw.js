// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '657318010905'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  // Customize notification here
  const notification = payload.data
  const notificationTitle = notification.title;
  const notificationOptions = {
  	body: notification.body,
  	data: {
	  	click_action: notification.click_action
  	},
    icon: '/images/notification/icon.png',
  	badge: '/images/notification/badge.png',
  	tag: notification.tag,
    renotify: true,
  	vibrate: [150,100,150,100,200]
  }

  return self.registration.showNotification(notificationTitle,
      notificationOptions)
})
// [END background_handler]


//perform action when the notification is clicked
self.addEventListener('notificationclick', function(event) {
  const clickedNotification = event.notification
  const urlToOpen = clickedNotification.data.click_action
  console.log("urlToOpen", urlToOpen)
  clickedNotification.close()

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    let matchingClient = null

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i]
      console.log("windowClient.url", windowClient.url)
      if (windowClient.url === urlToOpen) {
        //if the url is already opened, focus on the tab
        matchingClient = windowClient
        break
      }

      // else{
      //   //if there are no matching url, navigate to the url
      //   matchingClient = windowClient
      //   return windowClient.navigate(urlToOpen)
      //   break
      // }
    }

    if (matchingClient) {
      return matchingClient.focus()
    } else {
      return clients.openWindow(urlToOpen)
    }
  })

  event.waitUntil(promiseChain)
})













