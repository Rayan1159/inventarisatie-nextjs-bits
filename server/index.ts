require('ignore-styles');

require("@babel/register")({
    presets: [
        '@babel/preset-env', 
        '@babel/preset-react',
        '@babel/preset-typescript'
    ],
    ignore: [/(node_modules)/],
    extensions: [
        '.ts',
        '.js,',
        '.jsx',
        '.tsx'
    ]
});

require('./server');
