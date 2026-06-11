'use client'

import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useAuthDialog } from '@/app/components/auth/AuthDialogProvider'

const Profile = () => {
  const { data: session, status } = useSession()
  const { open } = useAuthDialog()

  if (status === 'loading') {
    return (
      <div className="size-9 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <Button size="sm" variant="default" onClick={() => open('login')}>
        Iniciar sesión
      </Button>
    )
  }

  const name = session.user.name ?? session.user.email ?? 'Usuario'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="relative shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="size-8 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center font-medium text-sm"
            aria-label="Menú de usuario"
          >
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={name}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              initial
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{name}</span>
              {session.user.email && (
                <span className="text-xs text-muted-foreground">{session.user.email}</span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOut({ redirectTo: '/' })} className="gap-2">
            <Icon icon="tabler:logout" className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Profile
