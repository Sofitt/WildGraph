import { useEffect, useRef } from 'react'

const onClick = (event: MouseEvent) => {
  event.preventDefault()

  const agreement = confirm('Ссылка ведет на сторонникй ресурс. Вы уверены, что хотите перейти?')
  if (!agreement) return

  const target = event.target as HTMLAnchorElement
  window.open(target.href, '_blank')?.focus()
}
export const useExternalLink = () => {
  const links = useRef<NodeListOf<HTMLAnchorElement> | null>(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      links.current = document.querySelectorAll<HTMLAnchorElement>(`a[data-another-domen=true]`)

      Array.from(links.current || []).forEach((el) => {
        el.addEventListener('click', onClick)
      })
    }, 0)

    return () => {
      clearTimeout(timer)
      if (links.current) {
        Array.from(links.current).forEach((el) => {
          el.removeEventListener('click', onClick)
        })
      }
    }
  })
}
