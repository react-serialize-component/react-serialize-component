module.exports = {
  '/api/test/2': (req, res, next) => {
    console.log('1234444');
    const data = {
      code: 10000,
      data: {
        a: 1,
        b: 2,
      },
    };
    res.json(data);
  },
};
