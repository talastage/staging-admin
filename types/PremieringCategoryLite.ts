// PremieringCategoryLite.ts

import { PremieringCategoryBase } from './PremieringCategoryBase'

/**
 * Picks only the columns that the "lite" resource returns
 */
export type PremieringCategoryLite = Pick<
  PremieringCategoryBase,
  'id' | 'name' | 'slug' | 'avatar_url'
>
