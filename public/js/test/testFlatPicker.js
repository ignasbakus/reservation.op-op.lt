let flatCalendar = {
    initialize: function () {
        $('#flatPickerCalendar').flatpickr({
            mode: 'range', // Enables range selection
            dateFormat: 'Y/m/d', // Date format
            minDate: "today",
            disableMobile: "true",
            disable: [
                {
                    from: "2024-07-15",
                    to: "2024-07-22"
                },
                "2024-07-29",
            ],
            // onReady: function (selectedDates, dateStr, instance) {
            //     instance.config.enable = calculateEnabledRanges(instance.config.disable);
            // },
            // onChange: function (selectedDates, dateStr, instance) {
            //     // Ensure range selection does not include disabled dates
            //     if (selectedDates.length === 2) {
            //         let startDate = selectedDates[0];
            //         let endDate = selectedDates[1];
            //         let isValidRange = true;
            //
            //         for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            //             if (!instance.isEnabled(d)) {
            //                 isValidRange = false;
            //                 break;
            //             }
            //         }
            //
            //         if (!isValidRange) {
            //             instance.clear();
            //             alert('The selected range includes disabled dates. Please select a valid range.');
            //         } else {
            //             console.log('Valid Date Range selected:', dateStr);
            //         }
            //     }
            // }
        });
    }
}

function calculateEnabledRanges(disabledDates) {
    let today = new Date();
    let maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 1); // set the maximum date to one month from today for this example

    let enabledRanges = [];
    let startRange = new Date(today);

    while (startRange <= maxDate) {
        if (!isDateDisabled(startRange, disabledDates)) {
            let endRange = new Date(startRange);

            while (endRange <= maxDate && !isDateDisabled(endRange, disabledDates)) {
                endRange.setDate(endRange.getDate() + 1);
            }

            endRange.setDate(endRange.getDate() - 1); // move back to the last valid date

            enabledRanges.push({
                from: new Date(startRange),
                to: new Date(endRange)
            });

            startRange = new Date(endRange);
        }

        startRange.setDate(startRange.getDate() + 1);
    }

    return enabledRanges;
}

function isDateDisabled(date, disabledDates) {
    for (let entry of disabledDates) {
        if (typeof entry === 'object' && entry.from && entry.to) {
            if (date >= new Date(entry.from) && date <= new Date(entry.to)) {
                return true;
            }
        } else if (typeof entry === 'string') {
            if (date.toDateString() === new Date(entry).toDateString()) {
                return true;
            }
        }
    }
    return false;
}

$(document).ready(function () {
    console.log("public/js/test/testFlatPicker.js -> ready!");
    flatCalendar.initialize();
});
