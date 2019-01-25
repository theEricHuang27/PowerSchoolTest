(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
const getClasses = async (username, password) => {
    // change to school directory
//    const PowerSchoolAPI = require("powerschool-ap");
    let classes = [];
    const api = new PowerSchoolAPI("https://powerschool.lmsd.org");
    try {
        setupApi = await api.setup();
        user = await setupApi.login(username, password);
        student = await user.getStudentInfo();
        student.courses.forEach(course => {
            classes.push(course.title);
        });
        return classes;
    } catch (error) {
        return console.error(error);
    }
}
},{"powerschool-api/index.js":3}],3:[function(require,module,exports){
const soap = require("strong-soap").soap;
const PowerSchoolUser = require("./models/PowerSchoolUser");

/** The main PowerSchool API wrapper, for logging into user accounts and caching of retrieved info. */
class PowerSchoolAPI {
    /**
     * Create an API wrapper.
     * @param {string} url - The main URL of the PowerSchool installation, such as "http://sales.powerschool.com".
     * @param {string} [apiUsername] - The API username to use for logging in, if your installation has a different one. For most installations, the default provided value should work.
     * @param {string} [apiPassword] - The API password to use for logging in, if your installation has a different one. For most installations, the default provided value should work.
     */
    constructor(url, apiUsername = "pearson", apiPassword = "m0bApP5") {
        this.url = url;
        this.apiUsername = apiUsername;
        this.apiPassword = apiPassword;
        this.ready = false;
        this.errored = false;
        this.requestOptions = { auth: { user: apiUsername, pass: apiPassword, sendImmediately: false } };
        this._cachedInfo = {};
    }

    /**
     * Setup the API wrapper for usage (required for any interaction).
     * @return {Promise.<PowerSchoolAPI, Error>} - A promise that returns the API again if resolved, or an Error if rejected. 
     */
    setup() {
        const publicPortalServiceURL = this.url + "/pearson-rest/services/PublicPortalServiceJSON";
        return new Promise((resolve, reject) => {
            soap.createClient(publicPortalServiceURL + "?wsdl", { wsdl_options: this.requestOptions }, (err, client) => {
                if(!client) {
                    this.errored = true;
                    return reject(err);
                }
                this.ready = true;
                client.setEndpoint(publicPortalServiceURL);
                this.client = client;
                resolve(this);
            });
        })
    }
    /**
     * Log into a user's account and get their user object.
     * @param {string} username - The username of the account to log in to.
     * @param {string} password - The password of the account to log in to.
     * @return {Promise.<PowerSchoolUser, Error>} - A promise that resolves with the user if login was successful, resolves to null if invalid credentials were provided, and rejects with an Error if another error occurred during login.
     */
    login(username, password) {
        return new Promise((resolve, reject) => {
            if(!this.ready) reject(null);
            this.client.loginToPublicPortal({username: username, password: password}, this.requestOptions, (err, result) => {
                if(!result || !result.return) return reject(err);
                if(!result.return.userSessionVO) return resolve(null);
                var user = new PowerSchoolUser(result.return.userSessionVO, this);
                resolve(user);
            });
        });
    }

    // - Cached Info

    storeCacheInfo(dataArray, dataType, idKey = "id") {
        if(!Array.isArray(dataArray)) dataArray = [dataArray];
        if(!this._cachedInfo[dataType]) this._cachedInfo[dataType] = {};
        dataArray.forEach((item) => this._cachedInfo[dataType][item[idKey]] = item);
    }
}

module.exports = PowerSchoolAPI;
},{"./models/PowerSchoolUser":19,"strong-soap":20}],4:[function(require,module,exports){
/** 
 * A PowerSchool assignment.
 * @hideconstructor
*/
class PowerSchoolAssignment {
    constructor(api, id, assignmentID, name, abbreviation, categoryID, courseID, description, dueDate, gradeBookType, weight, includeInFinalGrades, publishScores, scorePublishDate) {
        this.api = api;

        /**
         * The ID of this assignment.
         * @member {number}
         */
        this.id = id;

        /**
         * The secondary ID of this assignment in the system.
         * @member {number}
         */
        this.assignmentID = assignmentID;

        /**
         * The name of this assignment.
         * @member {string}
         */
        this.name = name;

        /**
         * A shorter name for this assignment.
         * @member {string}
         */
        this.abbreviation = abbreviation;

        /**
         * The category this assignment belongs to.
         * @member {number}
         */
        this.categoryID = categoryID;

        /**
         * The course this assignment belongs to.
         * @member {number}
         */
        this.courseID = courseID;

        /**
         * The description of this assignment, if available.
         * @member {string}
         */
        this.description = description;
        
        /**
         * The due date of this assignment.
         * @member {Date}
         */
        this.dueDate = dueDate;

        /**
         * The grade book type for this assignment.
         * @member {number}
         */
        this.gradeBookType = gradeBookType;
        
        /**
         * The weight this assignment carries on the overall course mark.
         * @member {number}
         */
        this.weight = weight;

        /**
         * Whether or not this assignment's mark will influence the final grade in this course.
         * @member {string}
         */
        this.includeInFinalGrades = includeInFinalGrades;

        /**
         * Whether scores for this assignment will be published or not.
         * @member {boolean}
         */
        this.publishScores = publishScores;

        /**
         * The specific date scores for this assignment will be published, if available.
         * @member {Date}
         */
        this.scorePublishDate = scorePublishDate;
    }

    static fromData(data, api) {
        return new PowerSchoolAssignment(api, data.id, data.assignmentid, data.name, data.abbreviation, data.categoryId, data.sectionid, data.description, new Date(data.dueDate), data.gradeBookType, data.weight, data.includeinfinalgrades == 1, data.publishscores == 1, data.scorePublishDate ? new Date(data.scorePublishDate) : null);
    }

    /**
     * Get the score received on this assignment, if available.
     * @return {PowerSchoolAssignmentScore}
     */
    getScore() {
        return this.api._cachedInfo.assignmentScores[this.id];
    }

    /**
     * Get the category this assigmment belongs to.
     * @return {PowerSchoolAssignmentCategory}
     */
    getCategory() {
        return this.api._cachedInfo.assignmentCategories[this.categoryID];
    }

    /**
     * Get the course this assigmment belongs to.
     * @return {PowerSchoolCourse}
     */
    getCourse() {
        return this.api._cachedInfo.courses[this.courseID];
    }
}

module.exports = PowerSchoolAssignment;
},{}],5:[function(require,module,exports){
/** 
 * A category for a PowerSchool assignment.
 * @hideconstructor
*/
class PowerSchoolAssignmentCategory {
    constructor(api, id, name, abbreviation, description, gradeBookType) {
        this.api = api;

        /**
         * The ID of this assignment.
         * @member {number}
         */
        this.id = id;

        /**
         * The name of this category.
         * @member {string}
         */
        this.name = name;

        /**
         * A shorter name for this category.
         * @member {string}
         */
        this.abbreviation = abbreviation;

        /**
         * A description of this category, if available.
         * @member {string}
         */
        this.description = description;

        /**
         * The grade book type for this assignment.
         * @member {number}
         */
        this.gradeBookType = gradeBookType;

        /**
         * The assignments in this category.
         * @member {Array.<PowerSchoolAssignment>}
         */
        this.assignments = [];
    }

    static fromData(data, api) {
        return new PowerSchoolAssignmentCategory(api, data.id, data.name, data.abbreviation, data.description, data.gradeBookType);
    }
}

module.exports = PowerSchoolAssignmentCategory;
},{}],6:[function(require,module,exports){
/** 
 * The score received for a PowerSchool assignment.
 * @hideconstructor
*/
class PowerSchoolAssignmentScore {
    constructor(api, id, assignmentID, collected, late, missing, exempt, gradeBookType, comment, score, letterGrade, percentage, scoreType) {
        this.api = api;

        /**
         * The ID of this assignment.
         * @member {number}
         */
        this.id = id;

        /**
         * The secondary ID of this assignment in the system.
         * @member {number}
         */
        this.assignmentID = assignmentID;

        /**
         * Whether or not this assignment has been collected yet.
         * @member {boolean}
         */
        this.collected = collected;

        /**
         * Whether or not this assignment is late.
         * @member {boolean}
         */
        this.late = late;

        /**
         * Whether or not this assignment is missing.
         * @member {boolean}
         */
        this.missing = missing;

        /**
         * Whether or not the student is exempt from completing this assignment.
         * @member {boolean}
         */
        this.exempt = exempt;
        
        /**
         * The grade book type for this assignment.
         * @member {number}
         */
        this.gradeBookType = gradeBookType;
        
        /**
         * The teacher's comment on this assignment, if available.
         * @member {string}
         */
        this.comment = comment;

        /**
         * The score received on this assignment.
         * @member {string}
         */
        this.score = score;

        /**
         * The score received on this assignment (as a percentage value from 0-1), if able to calculate.
         * @member {number}
         */
        this.percentage = percentage;

        /**
         * The letter grade received on this assignment (can be any string used for display of score).
         * @member {string}
         */
        this.letterGrade = letterGrade;
        
        /**
         * The scoring type used on this assignment.
         * @member {number}
         */
        this.scoreType = scoreType;
    }

    static fromData(data, api) {
        // Calculate floating percentage from the odd string given
        var percentage = Number.parseFloat(data.percent);
        if (Number.isNaN(percentage)) percentage = null;
        if (percentage !== null) percentage /= 100;

        return new PowerSchoolAssignmentScore(api, data.id, data.assignmentId, data.collected, data.late, data.missing, data.exempt, data.gradeBookType, data.comment, data.score, data.letterGrade, percentage, data.scoretype);
    }

    /**
     * Get the assignment this score was received on.
     * @return {PowerSchoolAssignment}
     */
    getAssignment() {
        return this.api._cachedInfo.assignments[this.assignmentID];
    }
}

module.exports = PowerSchoolAssignmentScore;
},{}],7:[function(require,module,exports){
/** 
 * A code assigned to a PowerSchool attendance record.
 * @hideconstructor
*/
class PowerSchoolAttendanceCode {
    constructor(api, id, code, description, type, schoolNumber, sortOrder, yearID) {
        this.api = api;

        /**
         * The ID of this attendance code.
         * @member {number}
         */
        this.id = id;

        /**
         * The string representing this code.
         * @member {string}
         */
        this.code = code;

        /**
         * A short description of this code.
         * @member {string}
         */
        this.description = description;

        /**
         * The type of this code.
         * @member {number}
         */
        this.type = type;

        /**
         * The number of the school this code belongs to.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;

        /**
         * A number representing the order this code should appear in when sorted.
         * @member {number}
         */
        this.sortOrder = sortOrder;

        /**
         * The year ID this code is valid for.
         * @member {number}
         */
        this.yearID = yearID;
    }

    static fromData(data, api) {
        return new PowerSchoolAttendanceCode(api, data.id, data.attCode, data.description, data.codeType, data.schoolid, data.sortorder, data.yearid);
    }

    /**
     * Get the school this code belongs to.
     * @return {PowerSchoolSchool}
     */
    getSchool() {
        return this.api._cachedInfo.schools[this.schoolNumber];
    }
}

module.exports = PowerSchoolAttendanceCode;
},{}],8:[function(require,module,exports){
/** 
 * A PowerSchool attendance record, such as a deviation from normal attendance.
 * @hideconstructor
*/
class PowerSchoolAttendanceRecord {
    constructor(api, id, codeID, comment, date, schoolNumber, periodID, studentID, totalMinutes) {
        this.api = api;

        /**
         * The ID of this attendance code.
         * @member {number}
         */
        this.id = id;

        /**
         * The identifier for this attendance record's code.
         * @member {number}
         */
        this.codeID = codeID;

        /**
         * A comment left with this record.
         * @member {string}
         */
        this.comment = comment;

        /**
         * The date the attendance for this record occurred on.
         * @member {Date}
         */
        this.date = date;

        /**
         * The number of the school this record was created by.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;

        /**
         * The identifier of the period this record covers.
         * @member {number}
         */
        this.periodID = periodID;

        /**
         * The identifier of the student this record involves.
         * @member {number}
         */
        this.studentID = studentID;

        /**
         * The number of minutes this record accounts for, if not all (zero).
         * @member {number}
         */
        this.totalMinutes = totalMinutes;
    }

    static fromData(data, api) {
        return new PowerSchoolAttendanceRecord(api, data.id, data.attCodeid, data.attComment, new Date(data.attDate), data.schoolid, data.periodid, data.studentid, data.totalMinutes);
    }

    /**
     * Get the school this record belongs to.
     * @return {PowerSchoolSchool}
     */
    getSchool() {
        return this.api._cachedInfo.schools[this.schoolNumber];
    }

    /**
     * Get the period this record covers.
     * @return {PowerSchoolPeriod}
     */
    getPeriod() {
        return this.api._cachedInfo.periods[this.periodID];
    }

    /**
     * Get the code of this record.
     * @return {PowerSchoolAttendanceCode}
     */
    getCode() {
        return this.api._cachedInfo.attendanceCodes[this.codeID];
    }
}

module.exports = PowerSchoolAttendanceRecord;
},{}],9:[function(require,module,exports){
/** 
 * A PowerSchool course.
 * @hideconstructor
*/
class PowerSchoolCourse {
    constructor(api, id, title, code, schoolNumber, termID, periodSort, roomName, sectionNumber, teacherID, expression, gradeBookType, description = null) {
        this.api = api;

        /**
         * The ID of this course.
         * @member {number}
         */
        this.id = id;

        /**
         * The title of this course.
         * @member {string}
         */
        this.title = title;

        /**
         * The code of this course.
         * @member {string}
         */
        this.code = code;

        /**
         * The number of the school this course is from.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;

        /**
         * The ID of the term this course is a part of.
         * @member {number}
         */
        this.termID = termID;

        /**
         * A number to use to sort this period among others.
         * @member {number}
         */
        this.periodSort = periodSort;

        /**
         * The name of the room this course takes place in.
         * @member {string}
         */
        this.roomName = roomName;

        /**
         * The number of the section this course is in.
         * @member {string}
         */
        this.sectionNumber = sectionNumber;

        /**
         * The ID of the teacher teaching this course.
         * @member {string}
         */
        this.teacherID = teacherID;

        /**
         * An expression to use to sort this course's period among others.
         * @member {string}
         */
        this.expression = expression;

        /**
         * The coursebook type of this course.
         * @member {number}
         */
        this.gradeBookType = gradeBookType;

        /**
         * The description text of this course.
         * @member {string}
         */
        this.description = description;
    }

    static fromData(data, api) {
        return new PowerSchoolCourse(api, data.id, data.schoolCourseTitle, data.courseCode, data.schoolNumber, data.termID, data.periodSort, data.roomName, data.sectionNum, data.teacherID, data.expression, data.gradeBookType, data.description);
    }

    /**
     * Get the term this course is a part of.
     * @return {PowerSchoolTerm}
     */
    getTerm() {
        return this.api._cachedInfo.terms[this.termID];
    }

    /**
     * Get the school this course is from.
     * @return {PowerSchoolSchool}
     */
    getSchool() {
        return this.api._cachedInfo.schools[this.schoolNumber];
    }

    /**
     * Get the teacher teaching this course.
     * @return {PowerSchoolTeacher}
     */
    getTeacher() {
        return this.api._cachedInfo.teachers[this.teacherID];
    }

    /**
     * Get the final grade received in this course, if available.
     * @return {PowerSchoolFinalGrade}
     */
    getFinalGrade() {
        return this.api._cachedInfo.finalGrades[this.id];
    }

    /**
     * Get any assignments associated with this course.
     * **NOTE:** This function filters through all assignments every time it is called, so use it sparingly.
     * @return {Array.<PowerSchoolAssignment>}
     */
    getAssignments() {
        return Object.values(this.api._cachedInfo.assignments).filter((a) => a.courseID == this.id);
    }
}

module.exports = PowerSchoolCourse;
},{}],10:[function(require,module,exports){
/** 
 * A PowerSchool event, such as a not in session day.
 * @hideconstructor
*/
class PowerSchoolEvent {
    constructor(api, id, type, date, description = null, schoolNumber = null) {
        this.api = api;
        
        /**
         * The ID of this event.
         * @member {number}
         */
        this.id = id;

        /**
         * The type of this event to group together with others.
         * @member {string}
         */
        this.type = type;

        /**
         * The date of this event.
         * @member {Date}
         */
        this.date = date;

        /**
         * The description for this event.
         * @member {string}
         */
        this.description = description;

        /**
         * The number of the school this event is from.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;
    }

    static fromData(data, api) {
        return new PowerSchoolEvent(api, data.id, data.calType, new Date(data.calendarDay), data.description, data.schoolNumber);
    }

    /**
     * Get the school this event is from.
     * @return {PowerSchoolSchool}
     */
    getSchool() {
        return this.api._cachedInfo.schools[this.schoolNumber];
    }
}

module.exports = PowerSchoolEvent;
},{}],11:[function(require,module,exports){
/** 
 * An object representing the final grade in a PowerSchool course.
 * @hideconstructor
*/
class PowerSchoolFinalGrade {
    constructor(api, id, grade, percentage, date, comment, reportingTermID, courseID) {
        this.api = api;
        
        /**
         * The ID of this event.
         * @member {number}
         */
        this.id = id;

        /**
         * The grade received in this course, to be displayed.
         * @member {string}
         */
        this.grade = grade;

        /**
         * The grade received in this course as a percentage (value from 0-1), if can be calculated.
         * @member {number}
         */
        this.percentage = percentage;

        /**
         * The date this mark was stored, if available.
         * @member {Date}
         */
        this.date = date;

        /**
         * The teacher's comment for this grade, if available.
         * @member {string}
         */
        this.comment = comment;

        /**
         * The identifier of the reporting term this grade is from.
         * @member {number}
         */
        this.reportingTermID = reportingTermID;

        /**
         * The identifier of the course this grade is from.
         * @member {number}
         */
        this.courseID = courseID;
    }

    static fromData(data, api) {
        return new PowerSchoolFinalGrade(api, data.id, data.grade, data.percent / 100, data.dateStored ? new Date(data.dateStored) : null, data.commentValue, data.reportingTermId, data.sectionid);
    }

    /**
     * Get the reporting term this grade is from.
     * @return {PowerSchoolReportingTerm}
     */
    getReportingTerm() {
        return this.api._cachedInfo.reportingTerms[this.reportingTermID];
    }

    /**
     * Get the course this grade is from.
     * @return {PowerSchoolCourse}
     */
    getCourse() {
        return this.api._cachedInfo.courses[this.courseID];
    }
}

module.exports = PowerSchoolFinalGrade;
},{}],12:[function(require,module,exports){
/** 
 * A PowerSchool period.
 * @hideconstructor
*/
class PowerSchoolPeriod {
    constructor(api, id, name, number, schoolNumber, sortOrder, yearID) {
        this.api = api;

        /**
         * The ID of this period.
         * @member {number}
         */
        this.id = id;

        /**
         * The name of this period.
         * @member {string}
         */
        this.name = name;

        /**
         * The number of this period.
         * @member {number}
         */
        this.number = number;

        /**
         * The number of the school this period is from.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;
        
        /**
         * A number to use to sort this period among others.
         * @member {number}
         */
        this.sortOrder = sortOrder;

        /**
         * The year ID of this period.
         * @member {number}
         */
        this.yearID = yearID;
    }

    static fromData(data, api) {
        return new PowerSchoolPeriod(api, data.id, data.name, data.periodNumber, data.schoolid, data.sortOrder, data.yearid);
    }

    /**
     * Get the school this period is from.
     * @return {PowerSchoolSchool}
     */
    getSchool() {
        return this.api._cachedInfo.schools[this.schoolID];
    }
}

module.exports = PowerSchoolPeriod;
},{}],13:[function(require,module,exports){
/** 
 * A PowerSchool reporting term. Marks are divided and given out in reporting terms.
 * @hideconstructor
*/
class PowerSchoolReportingTerm {
    constructor(api, id, title, termID, sortOrder, suppressGrades, suppressPercents, abbreviatedTitle = null) {
        this.api = api;
        
        /**
         * The ID of this reporting term.
         * @member {number}
         */
        this.id = id;
        
        /**
         * The title of this reporting term.
         * @member {string}
         */
        this.title = title;

        /**
         * The ID of this reporting term's term.
         * @member {number}
         */
        this.termID = termID;
        
        /**
         * A number to use to sort this reporting term among others.
         * @member {number}
         */
        this.sortOrder = sortOrder;

        /**
         * Whether or not to supress showing grades from this reporting term.
         * @member {boolean}
         */
        this.suppressGrades = suppressGrades;

        /**
         * Whether or not to supress showing grade percentages from this reporting term.
         * @member {boolean}
         */
        this.suppressPercents = suppressPercents;

        /**
         * The abbreviated title of this reporting term, for use in smaller spaces.
         * @member {string}
         */
        this.abbreviatedTitle = this.abbreviatedTitle;
    }

    static fromData(data, api) {
        return new PowerSchoolReportingTerm(api, data.id, data.title, data.termid, data.sortOrder, data.suppressGrades, data.suppressPercents, data.abbreviation);
    }
    
    /**
     * Get the term this reporting term is from.
     * @return {PowerSchoolTerm}
     */
    getTerm() {
        return this.api._cachedInfo.terms[this.termID];
    }

    /**
     * Get the final grades returned from this reporting term.
     * @return {Array.<PowerSchoolFinalGrade>}
     */
    getFinalGrades() {
        return Object.values(this.api._cachedInfo.finalGrades).filter((g) => g.reportingTermID == this.id);
    }
}

module.exports = PowerSchoolReportingTerm;
},{}],14:[function(require,module,exports){
/** 
 * A PowerSchool school information object.
 * @hideconstructor
*/
class PowerSchoolSchool {
    constructor(api, id, name, schoolNumber, formattedAddress, addressParts, phone, fax, lowGrade, highGrade, disabled, disabledMessage, disabledFeatures, abbreviation) {
        this.api = api;

        /**
         * The ID of this school.
         * @member {number}
         */
        this.id = id;
        
        /**
         * The name of this school.
         * @member {string}
         */
        this.name = name;
    
        /**
         * The number of this school.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;

        /**
         * The school's address, formatted for display.
         * @member {string}
         */
        this.formattedAddress = formattedAddress;

        /**
         * The part's making up the school's address (such as street address, city, state/province, country, ZIP/postal code).
         * @member {object}
         */
        this.addressParts = addressParts;

        /**
         * The school's phone number, formatted for display.
         * @member {string}
         */
        this.phone = phone;

        /**
         * The school's fax number, formatted for display.
         * @member {string}
         */
        this.fax = fax;

        /**
         * The lowest grade this school has.
         * @member {number}
         */
        this.lowGrade = lowGrade;

        /**
         * The highest grade this school has.
         * @member {number}
         */
        this.highGrade = highGrade;

        /**
         * Whether or not the school is currently disabled.
         * @member {boolean}
         */
        this.disabled = disabled;

        /**
         * Optional messages to display for the school if it is disabled (title and message keys in the object).
         * @member {object}
         */
        this.disabledMessage = disabledMessage;

        /**
         * Features that are disabled on the school (object with true or false, on disabled status of each key).
         * @member {object}
         */
        this.disabledFeatures = disabledFeatures;

        /**
         * The abbreviation for the school.
         * @member {object}
         */
        this.abbreviation = abbreviation;
    }

    static fromData(data, api) {
        return new PowerSchoolSchool(api, data.schoolId, data.name, data.schoolNumber, data.address, { streetAddress: data.schooladdress, city: data.schoolcity, state: data.schoolstate, country: data.schoolcountry, zip: data.schoolzip }, data.schoolphone, data.schoolfax, data.lowGrade, data.highGrade, data.schoolDisabled, data.schoolDisabledTitle || data.schoolDisabledMessage ? { title: data.schoolDisabledTitle, message: data.schoolDisabledMessage } : null, data.disabledFeatures, data.abbreviation);
    }

    /**
     * Get the attendance codes that belong to this school.
     * @return {PowerSchoolAttendanceCode}
     */
    getAttendanceCodes() {
        return Object.values(this.api._cachedInfo.attendanceCodes).filter((c) => c.schoolNumber == this.schoolNumber);
    }
}

module.exports = PowerSchoolSchool;
},{}],15:[function(require,module,exports){
/**
 * A object meant for holding basic information about a student.
 * @hideconstructor
 */
class PowerSchoolStudent {
    constructor(api, id, firstName, middleName, lastName, dateOfBirth, ethnicity, gender, gradeLevel, currentGPA, currentTerm, photoDate = null, currentMealBalance = 0, startingMealBalance = 0) {
        this.api = api;

        /**
         * The student's ID.
         * @member {number}
         */
        this.id = id;

        /**
         * The student's first/given name.
         * @member {string}
         */
        this.firstName = firstName;

        /**
         * The student's middle name.
         * @member {string}
         */
        this.middleName = middleName;

        /**
         * The student's last name/surname.
         * @member {string}
         */
        this.lastName = lastName;

        /**
         * The student's date of birth.
         * @member {Date}
         */
        this.dateOfBirth = dateOfBirth;

        /**
         * The student's ethnicity (can be one of many things determined by the school itself).
         * @member {string}
         */
        this.ethnicity = ethnicity;

        /**
         * The student's gender (can be one of many things determined by the school itself).
         * @member {string}
         */
        this.gender = gender;
        
        /**
         * The grade the student is currently in.
         * @member {number}
         */
        this.gradeLevel = gradeLevel;

        /**
         * The student's current GPA, if grades are available (null if not).
         * @member {number}
         */
        this.currentGPA = currentGPA;

        /**
         * The student's current term, if available (null if not).
         * @member {number}
         */
        this.currentTerm = currentTerm;

        /**
         * The date the student's photo was taken on.
         * @member {Date}
         */
        this.photoDate = photoDate;

        /**
         * The student's current meal balance, if supported.
         * @member {number}
         */
        this.currentMealBalance = currentMealBalance;
        
        /**
         * The student's starting meal balance, if supported.
         * @member {number}
         */
        this.startingMealBalance = startingMealBalance;
    }

    static fromData(data, api) {
        return new PowerSchoolStudent(api, data.id, data.firstName, data.middleName, data.lastName, new Date(data.dob), data.ethnicity, data.gender, data.gradeLevel, data.currentGPA || null, data.currentTerm, data.photoDate ? new Date(data.photoDate) : null, data.currentMealBalance, data.startingMealBalance);
    }
    
    /**
     * Get the parts making up a student's name.
     * @param {boolean} [includeMiddleName] - Whether or not to include the student's middle name.
     * @return {Array.<string>}
     */
    getNameParts(includeMiddleName = false) {
        if(includeMiddleName && this.middleName && this.middleName.length > 0) return [this.firstName, this.middleName, this.lastName];
        return [this.firstName, this.lastName];
    }

    /**
     * Get student's name formatted for display.
     * @param {boolean} [includeMiddleName] - Whether or not to include the student's middle name.
     * @return {string}
     */
    getFormattedName(includeMiddleName = false) {
        return this.getNameParts(includeMiddleName).join(" ");
    }

    /**
     * Get the current reporting term the student is in.
     * @return {PowerSchoolReportingTerm}
     */
    getCurrentReportingTerm() {
        // Why did they make this a title instead of ID?
        return this.api._cachedInfo.reportingTerms.find((term) => term.title == this.currentTerm);
    }
}

module.exports = PowerSchoolStudent;
},{}],16:[function(require,module,exports){
/**
 * Holds information about the student.
 * @hideconstructor
*/
class PowerSchoolStudentInfo {
    constructor() {
        /**
         * The student's school.
         * @member {PowerSchoolSchool}
         */
        this.schools = null;

        /**
         * The student's available periods.
         * @member {Array.<PowerSchoolPeriod>}
         */
        this.periods = null;

        /**
         * The student's current courses.
         * @member {Array.<PowerSchoolCourse>}
         */
        this.courses = null;

        /**
         * The student's available terms.
         * @member {Array.<PowerSchoolTerm>}
         */
        this.terms = null;

        /**
         * The student's reporting terms.
         * @member {Array.<PowerSchoolReportingTerm>}
         */
        this.reportingTerms = null;

        /**
         * The student's days where school isn't in session.
         * @member {Array.<PowerSchoolEvent>}
         */
        this.notInSessionDays = null
        
        /**
         * An object holding basic information about this student.
         * @member {PowerSchoolStudent}
         */
        this.student = null;

        /**
         * The student's teachers.
         * @member {Array.<PowerSchoolTeacher>}
         */
        this.teachers = null;

        /**
         * The student's current year ID.
         * @member {number}
         */
        this.yearID = null;

        /**
         * The student's assignments, sorted into categories
         * @member {Array.<PowerSchoolAssignmentCategory>}
         */
        this.assignmentCategories = null;

        /**
         * The student's attendance records (deviations from normal attendance).
         * @member {Array.<PowerSchoolAttendanceRecord>}
         */
        this.attendanceRecords = null;

        /**
         * The student's available attendance codes.
         * @member {Array.<PowerSchoolAttendanceCode>}
         */
        this.attendanceCodes = null;

        /**
         * The student's final grades.
         * @member {Array.<PowerSchoolFinalGrade>}
         */
        this.finalGrades = null;
    }
}

module.exports = PowerSchoolStudentInfo;
},{}],17:[function(require,module,exports){
/** 
 * A PowerSchool teacher object.
 * @hideconstructor
*/
class PowerSchoolTeacher {
    constructor(id, firstName, lastName, email, schoolPhone) {
        /**
         * The ID of this teacher.
         * @member {number}
         */
        this.id = id;

        /**
         * The first name of this teacher.
         * @member {string}
         */
        this.firstName = firstName;

        /**
         * The last name of this teacher.
         * @member {string}
         */
        this.lastName = lastName;

        /**
         * The email of this teacher, if provided.
         * @member {string}
         */
        this.email = email;

        /**
         * The phone of this teacher's school, if provided.
         * @member {string}
         */
        this.schoolPhone = schoolPhone;
    }
    
    static fromData(data) {
        return new PowerSchoolTeacher(data.id, data.firstName, data.lastName, data.email, data.schoolPhone);
    }

    /**
     * Get the parts making up a teacher's name.
     * @return {Array.<string>}
     */
    getNameParts(includeMiddleName = false) {
        return [this.firstName, this.lastName];
    }

    /**
     * Get teacher's name formatted for display.
     * @return {string}
     */
    getFormattedName(includeMiddleName = false) {
        return this.getNameParts().join(" ");
    }
}

module.exports = PowerSchoolTeacher;
},{}],18:[function(require,module,exports){
/** 
 * A PowerSchool term, for which courses can be a part of.
 * @hideconstructor
*/
class PowerSchoolTerm {
    constructor(api, id, title, startDate, endDate, parentTermID, schoolNumber, abbreviatedTitle = null) {
        this.api = api;

        /**
         * The ID of this term.
         * @member {number}
         */
        this.id = id;

        /**
         * The title of this term.
         * @member {string}
         */
        this.title = title;

        /**
         * The start date of this term.
         * @member {Date}
         */
        this.startDate = startDate;

        /**
         * The end date of this term.
         * @member {Date}
         */
        this.endDate = endDate;

        /**
         * The ID of this term's parent (0 if none).
         * @member {number}
         */
        this.parentTermID = parentTermID;

        /**
         * The number of the school this term is from.
         * @member {number}
         */
        this.schoolNumber = schoolNumber;

        /**
         * The abbreviated title of this term, for use in smaller spaces.
         * @member {string}
         */
        this.abbreviatedTitle = abbreviatedTitle;
    }

    static fromData(data, api) {
        return new PowerSchoolTerm(api, data.id, data.title, new Date(data.startDate), new Date(data.endDate), data.parentTermId, data.schoolNumber, data.abbrev);
    }

    /**
     * Get the school this term is from.
     * @return {PowerSchoolSchool}
     */
    getSchool() {
        return this.api._cachedInfo.schools[this.schoolNumber];
    }
}

module.exports = PowerSchoolTerm;
},{}],19:[function(require,module,exports){
const PowerSchoolEvent = require("./PowerSchoolEvent");
const PowerSchoolTerm = require("./PowerSchoolTerm");
const PowerSchoolPeriod = require("./PowerSchoolPeriod");
const PowerSchoolReportingTerm = require("./PowerSchoolReportingTerm");
const PowerSchoolCourse = require("./PowerSchoolCourse");
const PowerSchoolStudent = require("./PowerSchoolStudent");
const PowerSchoolStudentInfo = require("./PowerSchoolStudentInfo");
const PowerSchoolSchool = require("./PowerSchoolSchool");
const PowerSchoolTeacher = require("./PowerSchoolTeacher");
const PowerSchoolAssignment = require("./PowerSchoolAssignment");
const PowerSchoolAssignmentScore = require("./PowerSchoolAssignmentScore");
const PowerSchoolAssignmentCategory = require("./PowerSchoolAssignmentCategory");
const PowerSchoolAttendanceRecord = require("./PowerSchoolAttendanceRecord");
const PowerSchoolAttendanceCode = require("./PowerSchoolAttendanceCode");
const PowerSchoolFinalGrade = require("./PowerSchoolFinalGrade");

/** 
 * A PowerSchool API user, which holds information about the user and methods to interact with them.
 * @hideconstructor
*/
class PowerSchoolUser {
    constructor(session, api) {
        this.session = session;
        if(this.session.serverCurrentTime) {
            // For some reason it provides it in a different format than it provides (wants ISO 8601)
            this.session.serverCurrentTime = new Date(this.session.serverCurrentTime).toISOString();
        }
        this.api = api;
        this._initUserVariables();
    }

    _initUserVariables() {
        this.userID = this.session.userId;
        this.userType = this.session.userType;
        // We need to fetch these separately
        this.studentData = new PowerSchoolStudentInfo();
    }

    /**
     * Get information about this student.
     * @return {Promise.<PowerSchoolStudentInfo, Error>} A promise that resolves with the user's student info, and rejects with an Error if one occurred.
     */
    getStudentInfo() {
        return new Promise((resolve, reject) => {
            var data = {
                userSessionVO: {
                    userId: this.userID,
                    serviceTicket: this.session.serviceTicket,
                    serverInfo: {
                        apiVersion: this.session.serverInfo.apiVersion
                    },
                    serverCurrentTime: this.session.serverCurrentTime,
                    userType: this.userType
                },
                studentIDs: this.session.studentIDs,
                qil: {
                    includes: "1"
                }
            }
            this.api.client.getStudentData(data, this.api.requestOptions, (err, result) => {
                if(!result || !result.return || !result.return.studentDataVOs) return reject(err);
                var data = result.return.studentDataVOs;

                // Deserialize any data we might need for special types
                var schools = (typeof data.schools === "array" ? data.schools : [data.schools]).map((data) => PowerSchoolSchool.fromData(data, this.api)); // for some reason sometimes is an array, sometimes is one school.
                var teachers = data.teachers.map((data) => PowerSchoolTeacher.fromData(data));
                var terms = data.terms.map((data) => PowerSchoolTerm.fromData(data, this.api));
                var reportingTerms = data.reportingTerms.map((data) => PowerSchoolReportingTerm.fromData(data, this.api));
                var assignments = data.assignments.map((data) => PowerSchoolAssignment.fromData(data, this.api));
                var assignmentScores = data.assignmentScores.map((data) => PowerSchoolAssignmentScore.fromData(data, this.api));
                var attendanceCodes = data.attendanceCodes.map((data) => PowerSchoolAttendanceCode.fromData(data, this.api));
                var periods = data.periods.map((data) => PowerSchoolPeriod.fromData(data, this.api));
                var courses = data.sections.map((data) => PowerSchoolCourse.fromData(data, this.api));
                var finalGrades = data.finalGrades.map((data) => PowerSchoolFinalGrade.fromData(data, this.api));

                // Add assignments to their categories
                var assignmentCategories = {};
                data.assignmentCategories.forEach((data) => assignmentCategories[data.id] = PowerSchoolAssignmentCategory.fromData(data, this.api));
                assignments.filter((a) => assignmentCategories[a.categoryID]).forEach((a) => assignmentCategories[a.categoryID].assignments.push(a));

                // Store information needed for other data mappings
                this.api.storeCacheInfo(teachers, "teachers");
                this.api.storeCacheInfo(schools, "schools", "schoolNumber");
                this.api.storeCacheInfo(periods, "periods");
                this.api.storeCacheInfo(courses, "courses");
                this.api.storeCacheInfo(finalGrades, "finalGrades", "courseID");
                this.api.storeCacheInfo(terms, "terms");
                this.api.storeCacheInfo(reportingTerms, "reportingTerms");
                this.api.storeCacheInfo(Object.values(assignmentCategories), "assignmentCategories");
                this.api.storeCacheInfo(assignments, "assignments");
                this.api.storeCacheInfo(assignmentScores, "assignmentScores", "assignmentID");
                this.api.storeCacheInfo(attendanceCodes, "attendanceCodes");

                // Store the rest of the data for use in the student model
                this.studentData.schools = schools;
                this.studentData.teachers = teachers;
                this.studentData.periods = periods;
                this.studentData.courses = courses;
                this.studentData.terms = terms;
                this.studentData.reportingTerms = reportingTerms;
                this.studentData.notInSessionDays = data.notInSessionDays.map((data) => PowerSchoolEvent.fromData(data, this.api));
                this.studentData.student = PowerSchoolStudent.fromData(data.student, this.api);
                this.studentData.yearID = data.yearId;
                this.studentData.assignmentCategories = Object.values(assignmentCategories);
                this.studentData.attendanceRecords = data.attendance.map((data) => PowerSchoolAttendanceRecord.fromData(data, this.api));
                this.studentData.attendanceCodes = attendanceCodes;
                this.studentData.finalGrades = finalGrades;

                resolve(this.studentData);
            });
        });
    }
}

module.exports = PowerSchoolUser;
},{"./PowerSchoolAssignment":4,"./PowerSchoolAssignmentCategory":5,"./PowerSchoolAssignmentScore":6,"./PowerSchoolAttendanceCode":7,"./PowerSchoolAttendanceRecord":8,"./PowerSchoolCourse":9,"./PowerSchoolEvent":10,"./PowerSchoolFinalGrade":11,"./PowerSchoolPeriod":12,"./PowerSchoolReportingTerm":13,"./PowerSchoolSchool":14,"./PowerSchoolStudent":15,"./PowerSchoolStudentInfo":16,"./PowerSchoolTeacher":17,"./PowerSchoolTerm":18}],20:[function(require,module,exports){
(function (process){
'use strict';

var base = './lib/';
var nodeVersion = process.versions.node;
var major = Number(nodeVersion.split('.')[0]);
if (major >= 4) {
  base = './src/';
}

var securityModules = require(base + 'security/index');

module.exports = {
  'soap': require(base + 'soap'),
  'http': require(base + 'http'),
  'QName': require(base + 'parser/qname'),
  'WSDL': require(base + 'parser/wsdl'),
};

for (var i in securityModules) {
  module.exports[i] = securityModules[i];
}

}).call(this,require('_process'))
},{"_process":1}]},{},[2]);

window.findClasses = function(username, password) {
    getClasses(username, password);
};
