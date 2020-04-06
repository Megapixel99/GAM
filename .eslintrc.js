module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        "import/order": "off",
        "global-require": "off",
        "no-useless-concat": "off",
        "no-param-reassign": "off",
        "no-loop-func": "off",
        "no-await-in-loop": "off",
        "no-console": "off"
    },
};