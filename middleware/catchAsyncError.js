module.exports = (myfun) => (req, res, next) => {
    Promise.resolve(myfun(req, res, next).catch(next))
}