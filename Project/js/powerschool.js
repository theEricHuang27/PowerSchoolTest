const PowerSchoolAPI = require("C:/Users/aidan/Documents/GitHub/PowerSchool-API/index");
const readline = require("readline-sync");

// May's has a teacherID of 12177
const className = "AP English Language and Composition";
let worstAssignment = "None";
let bestGrade;

const calculate = (major, minor) => {

    // create storage variables
    let majorActual = 0;
    let majorPossible = 0;
    let minorActual = 0;
    let minorPossible = 0;

    // sum up elements
    major.forEach(element => {
        majorActual += element[1];
        majorPossible += element[2];
    });
    minor.forEach(element => {
        minorActual += element[1];
        minorPossible += element[2];
    });
    
    return 0.6*(majorActual/majorPossible) + 0.4*(minorActual/minorPossible);
}

// try to load test credentials from file if exists
var testCredentials = {};
try {
    testCredentials = require("./test-credentials.json");
} catch (e) {}

// Get information from the user.
const url = testCredentials.url || readline.question("Enter the PowerSchool installation URL (such as: http://sales.powerschool.com): ");
const username = testCredentials.username || readline.question("Enter your PowerSchool username: ");
const password = testCredentials.password || readline.question("Enter your PowerSchool password: ");
if(!url || !username || !password) return console.error("Invalid information entered.");

// Create a new PowerSchool wrapper with our installation URL.
var api = new PowerSchoolAPI(url);

// attempted translation to neater code,
api.setup().then(api => {
    return api.login(username, password);
}).then(user => {
    if (!user) return console.error("Invalid credentials provided.");
    return user.getStudentsInfo();
}).then(students => {
    // single PowerSchoolStudentInfo object
    info = students[0];
    // array of courses
    info.courses.forEach(course => {
        if (course.title === className) {
            // console.log(course.title);
            optimize(course);
        }
    })
}).catch(err => console.error(err));

async function optimize(course) {
    try {
        const assignments = await course.getAssignments();
        let minorWorks = [];
        let majorWorks = [];
        assignments.forEach(assignment => {
            // setup constant
            const score = assignment.getScore();
            // if score is exempt, null, or NaN, exclude it from calculations
            if (!score.exempt && score.score && score.percentage) {
                // either major works or minor works
                if (assignment.getCategory().name === "Minor Works") {
                    minorWorks.push([assignment.name, Number(score.score), Math.round(Number(score.score)/score.percentage)]);
                    // console.log(`Name: ${assignment.name} Score: ${score.score}/${Math.round(Number(score.score)/score.percentage)} was added to Minor Works`)
                }
                else {
                    majorWorks.push([assignment.name, Number(score.score), Math.round(Number(score.score)/score.percentage)]);
                    // console.log(`Name: ${assignment.name} Score: ${score.score}/${Math.round(Number(score.score)/score.percentage)} was added to Major Works`)
                }
            } else {
                // console.log(`${assignment.name} was excluded from the calculations.`)
            }
        });

        bestGrade = calculate(majorWorks, minorWorks);
        // console.log(`Current Grade: ${bestGrade}`);

        for (let i = 0; i < majorWorks.length; i++) {
            const modifiedWorks = majorWorks.filter((element, index) => (index === i ? false : true));
            if (calculate(modifiedWorks, minorWorks) > bestGrade) {
                bestGrade = calculate(modifiedWorks, minorWorks);
                worstAssignment = majorWorks[i][0];
            }
        }
        for (let i = 0; i < minorWorks.length; i++) {
            const modifiedWorks = minorWorks.filter((element, index) => (index === i ? false : true));
            if (calculate(majorWorks, modifiedWorks) > bestGrade) {
                bestGrade = calculate(majorWorks, modifiedWorks);
                worstAssignment = minorWorks[i][0];
            }
        }

        // console.log(`Worst Assignment: ${worstAssignment} New Grade: ${bestGrade}`);
        return [bestGrade, worstAssignment, bestGrade];
    
    } catch (err) {
        // console.log(err);
        return err;
    }
    
}

//

/*
    IDEAS
        make the calculate function take in as many params as you want
            for loop for each forEach loop
            make a list of actual and possible value pairs and keep adding
            split return statment into a loop statement and then a return statement

        when sorting into categories make it a object with category as a key and then a list of values as a property
            can add items to already existing categories
            if it doesn't fall into an old category, make a new one

        but i DO NOT know to how to find the weighting through the api so, unless i want some sort of mad dictionary...
*/