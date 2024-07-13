let flatCalendar = {
    initialize: function () {
        $('#flatPickerCalendar').flatpickr({
            mode: 'range', // Enables range selection
            dateFormat: 'Y/m/d', // Date format
            minDate: "today",
            disableMobile: true, // Force Flatpickr to use its own picker on mobile devices
            disable: [
                {
                    from: "2024-07-15",
                    to: "2024-07-22"
                },
                "2024-07-29",
            ],
            onChange: function (selectedDates, dateStr, instance) {
                // Ensure range selection does not include disabled dates
                if (selectedDates.length === 2) {
                    let startDate = selectedDates[0];
                    let endDate = selectedDates[1];
                    let isValidRange = true;

                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        if (isDateDisabled(d)) {
                            isValidRange = false;
                            break;
                        }
                    }

                    if (!isValidRange) {
                        instance.clear();
                        alert('The selected range includes disabled dates. Please select a valid range.');
                    } else {
                        console.log('Valid Date Range selected:', dateStr);
                    }
                }
            }
        });
    }
};

function isDateDisabled(date) {
    const disabledDates = [
        {
            from: new Date("2024-07-15"),
            to: new Date("2024-07-22")
        },
        new Date("2024-07-29"),
    ];

    for (let entry of disabledDates) {
        if (entry instanceof Object && entry.from && entry.to) {
            if (date >= entry.from && date <= entry.to) {
                return true;
            }
        } else if (entry instanceof Date) {
            if (date.toDateString() === entry.toDateString()) {
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
