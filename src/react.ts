import type {
    ComponentProps,
    ElementType,
    ReactElement,
    Ref,
} from 'react'
import {
    createElement,
    forwardRef,
} from 'react'

import type {
    Simplify,
    VariantOptions,
    Variants,
    VariantsConfig,
} from './variants'
import { variants } from './variants'

/**
 * Utility type to infer the first argument of a variantProps function.
 */
export type VariantPropsOf<Type> = Type extends (props: infer Props) => any ? Props : never

/**
 * Type for the variantProps() argument – consists of the VariantOptions and an optional className for chaining.
 */
type VariantProps<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
> = VariantOptions<Config> & { className?: string }

export function variantProps<
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = Config['variants']
>(config: Simplify<Config>) {
    const variantClassName = variants<Config>(config)

    return <Props extends VariantProps<Config>>(props: Props) => {
        const result: any = {}

        // Pass-through all unrelated props
        for (let prop in props) {
            if (!(prop in config.variants)) {
                result[prop] = props[prop]
            }
        }

        // Add the optionally passed className prop for chaining
        result.className = [props.className, variantClassName(props)]
            .filter(Boolean)
            .join(' ')

        return result as Omit<Props, keyof Config['variants']> & { className: string }
    }
}

type VariantsOf<Type, Variant> = Type extends VariantsConfig ? Variant : {}

type AsProps<Type extends ElementType = ElementType> = {
    as?: Type
}

type PolymorphicComponentProps<Type extends ElementType> = AsProps<Type> &
    Omit<ComponentProps<Type>, 'as'>

export function styled<
    Type extends ElementType,
    Config extends VariantsConfig<Variant>,
    Variant extends Variants = VariantsOf<Config, Config['variants']>
>(type: Type, config: Simplify<Config> | string) {
    const styledProps =
        typeof config === 'string'
            ? variantProps({
                base: config,
                variants: {},
            })
            : variantProps(config)

    const Component: <As extends ElementType = Type>(
        props: PolymorphicComponentProps<As> & VariantOptions<Config>,
    ) => ReactElement | null = forwardRef(
        ({
            as,
            ...props
        }: AsProps, ref: Ref<Element>) => {
            return createElement(as ?? type, {
                ...styledProps(props),
                ref,
            })
        },
    )

    return Component
}

/**
 * No-op function to mark template literals as tailwind strings.
 */
export const tw = String.raw
