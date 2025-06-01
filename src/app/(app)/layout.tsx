import { Navigation } from '~/components/custom/Navigation'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Navigation />
      <main>{children}</main>
    </div>
  )
}
