import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Resources/')({
  component: () => <div>Select a Resource to edit.</div>
})