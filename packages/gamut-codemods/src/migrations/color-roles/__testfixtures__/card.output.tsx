import { Card } from '@skillsoft/gamut';
import { Card as OtherCard } from './OtherCard';

export const Cards = ({ featured }: { featured: boolean }) => (
  <>
    <Card variant="default">White</Card>
    <Card variant="default">Beige</Card>
    <Card /* color-roles: Card's 'navy' variant becomes 'default' (surface-raised), which renders light. If this card should stay dark, wrap it in <ColorMode mode="dark">. */ variant="default">Navy</Card>
    <Card variant={featured ? 'brand' : 'default'}>Yellow</Card>
    <Card variant="brand">Hyper</Card>
    <OtherCard variant="white">Not gamut's</OtherCard>
  </>
);
