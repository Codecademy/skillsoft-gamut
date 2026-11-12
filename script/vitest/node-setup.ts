/*
 * Setup for the Vitest `node` project. ESLint's RuleTester wraps each case in
 * global `describe`/`it` when they exist and runs them eagerly otherwise, so
 * point it at Vitest's (tests import them rather than using globals).
 */
import { TSESLint } from '@typescript-eslint/utils';
import { describe, it } from 'vitest';

TSESLint.RuleTester.describe = describe;
TSESLint.RuleTester.it = it;
// eslint-disable-next-line no-only-tests/no-only-tests
TSESLint.RuleTester.itOnly = it.only;
