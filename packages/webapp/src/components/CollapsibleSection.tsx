"use client";

import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, count, defaultOpen = false, children }: CollapsibleSectionProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <section className="mb-8">
          <DisclosureButton className="flex w-full items-center justify-between py-2 text-left group">
            <h3 className="text-lg font-semibold text-gray-800">
              {title}
              {count !== undefined && (
                <span className="ml-2 text-sm font-normal text-gray-500">({count})</span>
              )}
            </h3>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </DisclosureButton>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <DisclosurePanel>
              {children}
            </DisclosurePanel>
          </Transition>
        </section>
      )}
    </Disclosure>
  )
}
