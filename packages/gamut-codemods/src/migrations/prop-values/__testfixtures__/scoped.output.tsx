import { Badge as CodecademyBadge } from '@codecademy/gamut';
import { FillButton as Btn, Modal } from '@skillsoft/gamut';

const Button = (props: { size: string }) => <span {...props} />;

export const Scoped = () => (
  <>
    <Btn size="sm">Aliased</Btn>
    <Button size="small" />
    <Modal size="small" />
    <CodecademyBadge size="base" />
  </>
);
