export default ({ config }) => {
  return {
    ...config,
    name: "Sellistoo",
    slug: "sellistoo",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.API_URL,
    },
  };
};
