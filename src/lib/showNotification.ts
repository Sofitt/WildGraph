export function showNotification(text: string) {
  let container = document.getElementById('notification-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'notification-container'
    Object.assign(container.style, {
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: '1000',
    })
    document.body.appendChild(container)
  }

  const notification = document.createElement('div')
  notification.textContent = text
  Object.assign(notification.style, {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    marginBottom: '10px', // вертикальное смещение для нескольких уведомлений
    opacity: '0',
    transform: 'translateY(-100%)',
    transition: 'transform 0.5s, opacity 0.5s',
  })

  container.insertBefore(notification, container.firstChild)
  void notification.offsetWidth
  notification.style.opacity = '1'
  notification.style.transform = 'translateY(0)'

  setTimeout(() => {
    notification.style.opacity = '0'
    notification.style.transform = 'translateY(-100%)'
    setTimeout(() => notification.remove(), 500)
  }, 3000)
}
