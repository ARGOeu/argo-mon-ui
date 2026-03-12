interface TenantAvatarProps {
  name: string
  image?: string
  size?: 'sm' | 'md'
}

export default function TenantAvatar({
  name,
  image,
  size = 'md',
}: TenantAvatarProps) {
  const sizeClass = size === 'sm' ? 'size-6' : 'size-8'
  const textClass = size === 'sm' ? 'text-[0.6rem]' : 'text-xs'

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} rounded object-contain bg-surface-muted flex-shrink-0`}
      />
    )
  }
  return (
    <div
      className={`${sizeClass} rounded bg-slate-500 flex items-center justify-center flex-shrink-0`}
    >
      <span className={`${textClass} font-bold text-white`}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}
