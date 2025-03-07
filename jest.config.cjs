module.exports = {
    experimentalVMModules: true,
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!(dogecoinjs-lib)/)'],
};