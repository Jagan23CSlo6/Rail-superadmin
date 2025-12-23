const { registerSuperAdmin } = require('../controller/auth.controller');

module.exports.signUpHandler = async (event) => {
    const datas = JSON.parse(event.body);
    const result  = await registerSuperAdmin(datas);    
    return {
        statusCode: result.statusCode,
        body: JSON.stringify({ message: result.message }),
    };
}