module.exports = {
  '/api/test/2': (req, res, next) => {
    const data = {
      code: 10000,
      data: {
        a: 1,
        b: 2,
        date: +new Date(),
      },
    };
    res.json(data);
  },
};
