import { useState, type ImgHTMLAttributes } from 'react'

export function FadeImage({ className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      {...props}
      ref={(el) => {
        if (el?.complete) setLoaded(true)
      }}
      onLoad={() => setLoaded(true)}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
