'use strict'

// Parser to parse data coming from the backend
// An object with the following format should be return:
// {
//     'id' : {
//         'header' : 'content of header',
//         'body' : 'content of body',
//         'panel' : 'content of panel',
//         'items' : [{'id' : 'uid of item a'}, {'id' : 'uid of item b'}]
//         'color' : 'background color of rectangle'
//      },
//      ...
// }

// Note: 
// 'id' is the id of the element in the diagram to be matched
// 'header' is displayed above the rectangle; 
// 'body' is displayed beneath the rectangle;
// 'panel' is displayed in the detailed panel, when user click on the rectangle; 
// 'items' will be displayed inside the rectangle
// 'color' is the background color of that rectangle

module.exports.parse = function (response) {
    var parsedRes = {};

    parsedRes['time'] = response.data.time;
    parsedRes['machines'] = {};
    response.data.machines.forEach(function (e) {

        parsedRes['machines'][e.name] = {};
        parsedRes['machines'][e.name]['header'] = e.currentNumber + '/' + e.targetNumber;
        parsedRes['machines'][e.name]['footer'] = '';
        parsedRes['machines'][e.name]['panel'] = '<p>ID: ' + e.name + '</p>' +
            '<p>Currently processed amount: ' + e.currentNumber + '</p>' +
            '<p>Target amount: ' + e.targetNumber + '</p>';

        parsedRes['machines'][e.name]['body'] = '';

        if (e.onOffStatus == 0) {
            parsedRes['machines'][e.name]['color'] = 'green';
        } else if (e.onOffStatus == 1) {
            parsedRes['machines'][e.name]['color'] = 'yellow';
        } else {
            parsedRes['machines'][e.name]['color'] = 'red';
        }

    });

    return parsedRes;
}
