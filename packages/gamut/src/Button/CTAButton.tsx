import { createButtonComponent } from './shared/styles';
import { ctaButtonElevation, ctaButtonVariants } from './shared/variants';

export const CTAButton = createButtonComponent<{ variant?: 'primary' }>(
  ctaButtonElevation,
  ctaButtonVariants
);
