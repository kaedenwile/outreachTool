/**
 * Created by kaedenwile on 7/9/16.
 */

var borderedItems = [];
var errorNodes = [];
function wentWrong(element, message) {
    element.style.borderColor = "#BE1E2D";
    borderedItems.push(element);
    var errorNode = document.createElement("span");
    errorNode.className = "errorMessage";
    errorNode.innerHTML = message;
    element.parentElement.appendChild(errorNode);
    errorNodes.push(errorNode);
}

function returnToNormal() {
    var i;
    for (i = 0; i < borderedItems.length; i++) {
        borderedItems[i].style.borderColor = "white";
    }
    borderedItems = [];

    for (i = 0; i < errorNodes.length; i++) {
        errorNodes[i].parentNode.removeChild(errorNodes[i])
    }
    errorNodes = [];
}

// from: http://stackoverflow.com/questions/6177975/how-to-validate-date-with-format-mm-dd-yyyy-in-javascript
// Validates that the input string is a valid date formatted as "mm-dd-yyyy"
function isValidDate(dateString)
{
    // First check for the pattern
    if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("-");
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

function isRadioSelected(radioName) {
    var radioButtons = document.getElementsByName(radioName);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return true;
        }
    }
    return false;
}

function formIsValid() {
    returnToNormal();
    var isValid = true;

    for (var i = 0; i < myForm.length; i++) {
        var input = myForm[i];
        // it is assumed that every input has a name and a type
        if (!input.hasOwnProperty("name") || !input.hasOwnProperty("type")) continue;

        var element = document.getElementById(input.name);
        var value = element.value;

        var validations = [];

        switch (input.type) {
            case "NumInt":
                if ("wholeNumber" in input && input.wholeNumber) {
                    validations.push("wholeNumber");
                }
                /* v FALLTHROUGH v */
            case "NumFloat":
                validations.push("isBlank");
                validations.push("isNumber");
                if ("maxLength" in input) {
                    validations.push("tooLong");
                }
                if ("max" in input) {
                    validations.push("max");
                }
                if ("min" in input) {
                    validations.push("min");
                }
                break;
            case "DynamicDropDown":
                validations.push("asDynamicDropDown");
                /* v FALLTHROUGH v */
            case "textS":
            case "textL":
                validations.push("isBlank");
                if ("maxLength" in input) {
                    validations.push("tooLong");
                }
                break;
            case "radio":
            case "radioSub":
                validations.push("isSelected");
                break;
            case "date": // not available except in initial form
                validations.push("isBlank");
                validations.push("isValidDate");
                break;
        }

        if (contains(validations, "asDynamicDropDown")) {
            value = element.options[element.selectedIndex].value;
            if (value == "_other") value = document.getElementById(input.name+"_other");
        }

        var oldIsValid = isValid;
        isValid = false;
        if (contains(validations, "isBlank") && value == "") {
            wentWrong(element, "This is a mandatory field");
        } else if (contains(validations, "tooLong") && value.length > input.maxLength) {
            wentWrong(element, "Response must be shorter than "+input.maxLength+" characters");
        } else if (contains(validations, "isNumber") && isNaN(value)) {
            wentWrong(element, "Please enter a number");
        } else if (contains(validations, "min") && parseFloat(value) < input.min) {
            wentWrong(element, "Response must be greater than " + value);
        } else if (contains(validations, "max") && parseFloat(value) > input.max) {
            wentWrong(element, "Response must be less than " + value);
        } else if (contains(validations, "wholeNumber") && parseFloat(value) % 1 != 0) {
            wentWrong(element, "Please enter a whole number");
        } else if (contains(validations, "isSelected") && !isRadioSelected(input.name)) {
            wentWrong(element, "This is a mandatory field");
        } else if (contains(validations, "isValidDate") && !isValidDate(value)) {
            wentWrong(element, "Please enter a valid date (in the format yyyy-MM-dd)");
        } else {
            isValid = oldIsValid;
        }
    }


    return isValid
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function sendResults(nextPage, itemName) {
    var formResultsData = {};
    var eventOthers = [];
    for (var i = 0; i < myForm.length; i++) {
        var input = myForm[i];

        switch (input["type"]) {
            case "date":
            case "textS":
            case "textL":
            case "NumInt":
            case "NumFloat":
            case "checkbox":
            case "checkboxSub":
                formResultsData[input.name] = document.getElementById(input.name).value;
                break;

            case "radio":
            case "radioSub":
                var radioButtons = document.getElementsByName(input.name);
                for (var r = 0; r < radioButtons.length; r++) {
                    if (radioButtons[r].checked) {
                        formResultsData[input.name] = radioButtons[r].value;
                        break;
                    }
                }
                break;

            case "DynamicDropDown":
                var DDD = document.getElementById(input.name);
                var result = DDD.options[DDD.selectedIndex].value;
                if (result == "_other") {
                    var DDD_other = document.getElementById(input.name+"_other");
                    formResultsData[input.name] = DDD_other.value;
                    eventOthers.push({"list": input.list, "value": DDD_other.value, "label": DDD_other.value})
                } else formResultsData[input.name] = result;
                break;

            case "DropDown":
                var DD = document.getElementById(input.name);
                formResultsData[input.name] = DD.options[DD.selectedIndex].value;
                break;
        }

    }
    alert(JSON.stringify(formResultsData));
    sessionStorage.setItem(itemName, JSON.stringify(formResultsData));
    sessionStorage.setItem("others", JSON.stringify(eventOthers)); // will overwrite second time on purpose
    location.href = nextPage;
}

function checkIfHas(previousPage) {
    var testing = true; // TODO turn this off
    if (!testing) {
        if ((previousPage == "index" || previousPage == "eventType" || previousPage == "data") && (!sessionStorage.hasOwnProperty("formResultsData"))) {
            alert("I can't find your data from the previous page. I'm redirecting you now.");
            location.href = "index.html";
        } else if ((previousPage == "eventType" || previousPage == "data") && (!sessionStorage.hasOwnProperty("eventType"))) {
            alert("I can't find your data from the previous page. I'm redirecting you now.");
            location.href = "eventType.html";
        } else if (previousPage == "deeper" && !sessionStorage.hasOwnProperty("formResultDeeper")) {
            // alert("I can't find your data from the previous page. I'm redirecting you now.");
            // location.href = "eventType.html";
            alert("TODO")
        } else if (previousPage == "notes" && !sessionStorage.hasOwnProperty("eventNotes")) {
            alert("I can't find your data from the previous page. I'm redirecting you now.");
            location.href = "notes.html";
        }
    }
}

function onClickedRadio(event) {
    var radioButtons = document.getElementsByName(event.target.name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            showSubQuestions(radioButtons[i].value);
            break;
        }
    }
}

function onClickedCheckbox(event, subOutreach) {
    if (event.target.checked) {
        showSubQuestions(subOutreach);
    } else {
        deleteOldAddedRows(subOutreach);
    }
}

var addedRows = {};
function deleteOldAddedRows(name) {
    if (name in addedRows) {
        for (var i = 0; i < addedRows[name].length; i++) {
            var element = document.getElementById(addedRows[name][i]+"_row");
            element.parentNode.removeChild(element);
        }
        addedRows[name] = [];
    }
}

function showSubQuestions(subOutreach) {
    deleteOldAddedRows(event.target.name); // clean old rows

    var i;
    var newRows = []; // which rows to add?
    for (i = 0; i < myForm.length; i++) {
        if (myForm[i].hasOwnProperty("subOutreach") && myForm[i].subOutreach == subOutreach) {
            newRows.push(myForm[i]);
        }
    }

    var mAddedRows = [];
    var rowBefore = document.getElementById(event.target.name+"_row");
    for (i = 0; i < newRows.length; i++) {
        var rowItem = newRows[i];
        var row = document.createElement('tr');
        row.setAttribute('id', rowItem.name+'_row');

        row.innerHTML = "<td class='labelWrapper'><label for='"+rowItem.name+"'>"+rowItem.label+"</label></td>" +
            "<td>"+rowItem.html + "</td></tr>";

        rowBefore.parentNode.insertBefore(row, rowBefore.nextSibling);
        mAddedRows.push(rowItem.name);
        rowBefore = row;
    }
    addedRows[event.target.name] = mAddedRows;
}

function showfieldDDD(event) {
    var t = event.target;
    var name = t.id;
    if (t.options[t.selectedIndex].value == '_other')
        document.getElementById(name + "_otherDiv").innerHTML = "Other: <input type='text' id='" + name + "_other' style='padding-top: 2px;' />";
    else
        document.getElementById(name + "_otherDiv").innerHTML=' ';
}
