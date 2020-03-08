module.exports = {
    'root': true,
    'extends': 'eslint-config-airbnb-base',
    'env': {
        'node': true,
        'es6': true,
        'mocha': true
    },

    'rules': {
        'indent': ['error', 4],
        'import/no-dynamic-require': ['off'],
        'import/prefer-default-export': ['warn']
    }
}
