// "use-strict";
global getClasses = getClasses

const getClasses = async (username, password) => {
    // change to school directory
    const PowerSchoolAPI = require("./PowerSchool-API-master/index");
    let classes = [];
    const api = new PowerSchoolAPI("https://powerschool.lmsd.org");
    try {
        setupApi = await api.setup();
        user = await setupApi.login(username, password);
        student = await user.getStudentInfo();
        student.courses.forEach(course => {
            classes.push(course.title);
        });
        console.log(classes);
    } catch (error) {
        return error;
    }
}
