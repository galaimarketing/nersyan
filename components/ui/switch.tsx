'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

/* W3Schools-style rounded toggle switch (compact): 44×24px track, #ccc / #2196F3, white 18px knob */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative inline-block h-6 w-11 shrink-0 cursor-pointer rounded-full outline-none transition-[box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        'bg-[#ccc] data-[state=checked]:bg-[#2196F3]',
        'focus-visible:shadow-[0_0_0_1px_#2196F3]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block h-[18px] w-[18px] rounded-full bg-white shadow-sm',
          'absolute left-0.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ease-in-out',
          'translate-x-0 data-[state=checked]:translate-x-5',
          'rtl:translate-x-5 rtl:data-[state=checked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
