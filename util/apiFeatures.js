class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    //Api's search feature
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",
            }
        } : {};

        this.query = this.query.find({ ...keyword })
        return this;
    }

    filter() {
        // filter for category
        const queryCopy = { ...this.queryStr }
        // removing some filed from cat;

        const removeFields = ["keyword", "page", "limit"]
        removeFields.forEach((key) => delete queryCopy[key]);

        // filter for price and ratting
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));

        this.query = this.query.find(queryCopy);
        return this;

    }
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1)
        // here this .query is = product.find     
        this.query = this.query.limit(resultPerPage).skip(skip)

        return this


    }
}

module.exports = ApiFeatures