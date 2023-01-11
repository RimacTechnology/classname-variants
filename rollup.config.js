import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { main, module, source } from './package.json'

const extensions = ['.ts', '.tsx', '.js']

export default {
    external: id => {
        return !id.startsWith('.') && !id.startsWith('/')
    },
    input: source,
    output: [
        {
            file: main,
            format: 'cjs',
            sourcemap: true,
            plugins: [terser()],
        },
        {
            file: module,
            format: 'esm',
            sourcemap: true,
            exports: 'named',
            plugins: [terser()]
        },
    ],
    plugins: [
        nodeResolve({ extensions }),
        babel({
            babelHelpers: 'runtime',
            exclude: './node_modules/**',
            extensions,
        }),
        peerDepsExternal(),
    ],
}
