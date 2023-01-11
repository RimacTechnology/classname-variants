const presets = [
    [
        '@babel/preset-env',
        {
            targets: '> 5%, not dead, not IE 11',
            loose: true,
        },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
]

const plugins = [
    '@babel/plugin-transform-runtime',
    [
        '@babel/plugin-proposal-class-properties',
        {
            loose: true,
        },
    ],
    [
        '@babel/plugin-proposal-private-methods',
        {
            loose: true,
        },
    ],
    [
        '@babel/plugin-proposal-private-property-in-object',
        {
            loose: true,
        },
    ],
]

module.exports = {
    presets,
    plugins,
}
