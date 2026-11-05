import '@emotion/react';
import { SkillsoftTheme } from '../themes';

declare module '@emotion/react' {
  export interface Theme extends SkillsoftTheme {
    useLogicalProperties?: boolean;
  }
}
