import { useState, useEffect } from 'react'

interface TenantAvatarProps {
  name: string
  image?: string
  bgClass?: string
  size?: 'sm' | 'md'
}

export default function TenantAvatar({
  name,
  image,
  size = 'md',
  bgClass = 'bg-slate-500',
}: TenantAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const sizeClass = size === 'sm' ? 'size-6' : 'size-8'
  const textClass = size === 'sm' ? 'text-[0.6rem]' : 'text-xs'

  useEffect(() => {
    setImgError(false)
    setImgLoaded(false)
  }, [image])

  return (
    <div
      className={`${sizeClass} relative rounded ${bgClass} flex items-center justify-center flex-shrink-0`}
    >
      <span
        className={`${textClass} font-bold text-white leading-none select-none`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      {image && !imgError && (
        <img
          src={image}
          alt={name}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`absolute inset-0 size-full rounded object-contain bg-surface-muted transition-opacity duration-200 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
