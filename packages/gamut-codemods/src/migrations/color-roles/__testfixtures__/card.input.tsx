import { Card } from '@skillsoft/gamut';
import { Card as OtherCard } from './OtherCard';

export const Cards = ({ featured }: { featured: boolean }) => (
  <>
    <Card variant="white">White</Card>
    <Card variant="beige">Beige</Card>
    <Card variant="navy">Navy</Card>
    <Card variant={featured ? 'yellow' : 'default'}>Yellow</Card>
    <Card variant="hyper">Hyper</Card>
    <OtherCard variant="white">Not gamut's</OtherCard>
  </>
);
