/**
 * Definition of the available variants and their options.
 * @example
 * {
 *   color: {
 *     white: "bg-white"
 *     green: "bg-green-500",
 *   },
 *   size: {
 *     small: "text-xs",
 *     large: "text-lg"
 *   }
 * }
 */
export type Variants = Record<string, Record<string, string>>

/**
 * Configuration including defaults and compound variants.
 */
export interface VariantsConfig<Variant extends Variants> {
    base?: string
    compoundVariants?: CompoundVariant<Variant>[]
    defaultVariants?: Partial<OptionsOf<Variant>>
    variants: Variant
}

/**
 * Rules for class names that are applied for certain variant combinations.
 */
export interface CompoundVariant<Variant extends Variants> {
    className: string
    variants: Partial<OptionsOf<Variant>>
}

/**
 * Only the boolean variants, i.e. ones that have "true" or "false" as options.
 */
type BooleanVariants<Variant extends Variants> = {
    [Key in keyof Variant as Variant[Key] extends { false: any } | { true: any }
        ? Key
        : never]: Variant[Key];
}

/**
 * Only the variants for which a default options is set.
 */
type DefaultVariants<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
> = {
    [Key in keyof Variant as Key extends keyof Config['defaultVariants']
        ? Key
        : never]: Config['variants'][Key];
}

/**
 * Names of all optional variants, i.e. booleans or ones with default options.
 */
type OptionalVariantNames<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
> = keyof BooleanVariants<Variant> | keyof DefaultVariants<Config>

/**
 * Possible options for all the optional variants.
 *
 * @example
 * {
 *   color?: "white" | "green",
 *   rounded?: boolean | undefined
 * }
 */
type OptionalOptions<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
> = {
    [Key in keyof Variant as Key extends OptionalVariantNames<Config>
        ? Key
        : never]?: OptionsOf<Variant>[Key];
}

/**
 * Possible options for all required variants.
 *
 * @example {
 *   size: "small" | "large"
 * }
 */
type RequiredOptions<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
> = {
    [Key in keyof Variant as Key extends OptionalVariantNames<Config>
        ? never
        : Key]: OptionsOf<Variant>[Key];
}

/**
 * Utility type to extract the possible options.
 * Converts "true" | "false" options into booleans.
 *
 * @example
 * OptionsOf<{
 *   size: { small: "text-xs"; large: "text-lg" };
 *   rounded: { true: "rounded-full" }
 * }>
 * ==>
 * {
 *   size: "text-xs" | "text-lg";
 *   rounded: boolean;
 * }
 */
type OptionsOf<Variant extends Variants> = {
    [Key in keyof Variant]: keyof Variant[Key] extends 'false' | 'true' ? boolean : keyof Variant[Key];
}

/**
 * Extracts the possible options.
 */
export type VariantOptions<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
> = OptionalOptions<Config> & RequiredOptions<Config>

/**
 * Without this conversion step, defaultVariants and compoundVariants will
 * allow extra keys, i.e. non-existent variants.
 * See https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts
 */
export type Simplify<Type> = {
    [Key in keyof Type]: Type[Key];
}

export function variants<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
>(config: Simplify<Config>) {
    const {
        base,
        compoundVariants,
        defaultVariants,
        variants: variantsConfig,
    } = config

    const isBooleanVariant = (name: keyof Variant) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const v = variantsConfig?.[name]

        // @ts-expect-error
        return v && ('false' in v || 'true' in v)
    }

    return (props: VariantOptions<Config>) => {
        const response = [base]

        const getSelected = (name: keyof Variant) => {
            return (props as any)[name] ??
                defaultVariants?.[name] ??
                (isBooleanVariant(name) ? false : undefined)
        }

        for (let name in variantsConfig) {
            const selected = getSelected(name)

            if (selected !== undefined) {
                response.push(variantsConfig[name]?.[selected])
            }
        }

        for (let compoundVariant of compoundVariants ?? []) {
            const isSelected = (name: string) => {
                return getSelected(name) === compoundVariant.variants[name]
            }

            if (Object.keys(compoundVariant.variants).every(isSelected)) {
                response.push(compoundVariant.className)
            }
        }

        return response.filter(Boolean).join(' ')
    }
}
