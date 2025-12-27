const { getReport, getMonthRevenue, getYearlyRevenueGraph } = require('../controller/report.controller');
const { verifyTokenFromEvent } = require('./middleware/verifyToken');

// Handler for getting report data
module.exports.getReportHandler = async (event) => {
    // Verify token
    const tokenVerification = verifyTokenFromEvent(event);

    if (!tokenVerification.valid) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 401,
                message: tokenVerification.message
            }),
        };
    }

    try {
        const result = await getReport();
        
        return {
            statusCode: result.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: result.statusCode,
                message: result.message,
                data: result.data || null
            }),
        };

    } catch (err) {
        console.error('Report Handler Error:', err);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 500,
                message: 'Internal server error'
            }),
        };
    }
};

// Handler for getting monthly revenue
module.exports.getMonthRevenueHandler = async (event) => {
    // Verify token
    const tokenVerification = verifyTokenFromEvent(event);

    if (!tokenVerification.valid) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 401,
                message: tokenVerification.message
            }),
        };
    }

    try {
        // Extract month from query parameters or path parameters
        const month = event.queryStringParameters?.month || event.pathParameters?.month;
        
        const result = await getMonthRevenue(month);
        
        return {
            statusCode: result.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: result.statusCode,
                message: result.message,
                data: result.data || null
            }),
        };

    } catch (err) {
        console.error('Month Revenue Handler Error:', err);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 500,
                message: 'Internal server error'
            }),
        };
    }
};

// Handler for getting yearly revenue graph
module.exports.getYearlyRevenueGraphHandler = async (event) => {
    // Verify token
    const tokenVerification = verifyTokenFromEvent(event);

    if (!tokenVerification.valid) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 401,
                message: tokenVerification.message
            }),
        };
    }

    try {
        // Extract year from query parameters or path parameters
        const year = event.queryStringParameters?.year || event.pathParameters?.year;
        
        const result = await getYearlyRevenueGraph(year);
        
        return {
            statusCode: result.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: result.statusCode,
                message: result.message,
                data: result.data || null
            }),
        };

    } catch (err) {
        console.error('Yearly Revenue Graph Handler Error:', err);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                statusCode: 500,
                message: 'Internal server error'
            }),
        };
    }
};
