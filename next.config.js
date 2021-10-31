module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    config.experiments = { topLevelAwait: true };
    return config;
  },
  future: {
    webpack5: true,
  },
  images: {
    domains: ["zora.co", "images.unsplash.com"],
  },
};
