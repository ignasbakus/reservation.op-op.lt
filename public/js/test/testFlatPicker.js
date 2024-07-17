// let flatPickerCalendar = {
//     initialize: function (disabledDates) {
//         flatPicker = flatpickr('#flatPickerCalendar', {
//             mode: 'range', // Enables range selection
//             dateFormat: 'Y/m/d', // Date format
//             minDate: "today",
//             disable: disabledDates,
//             onChange: function (selectedDates, dateStr, instance) {
//                 // Ensure range selection does not include disabled dates
//                 if (selectedDates.length === 2) {
//                     let startDate = selectedDates[0];
//                     let endDate = selectedDates[1];
//                     let isValidRange = true;
//
//                     for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//                         if (flatPickerCalendar.isDateDisabled(d, disabledDates)) {
//                             isValidRange = false;
//                             break;
//                         }
//                     }
//
//                     if (!isValidRange) {
//                         instance.clear();
//                         // Perform any necessary actions when selection is invalid
//                         console.log('Invalid date range. Clearing selection.');
//                     } else {
//                         console.log('Valid Date Range selected:', dateStr);
//                     }
//                 }
//             },
//             onMonthChange: function (selectedDates, dateStr, instance) {
//                 console.log("Month changed to: ", instance.currentMonth + 1); // Months are zero-indexed
//                 flatPickerCalendar.updateDisabledDates(instance, disabledDates);
//             }
//         });
//     },
//     isDateDisabled: function (date, disabledDates) {
//         for (let entry of disabledDates) {
//             if (entry instanceof Object && entry.from && entry.to) {
//                 if (date >= entry.from && date <= entry.to) {
//                     return true;
//                 }
//             } else if (entry instanceof Date) {
//                 if (date.toDateString() === entry.toDateString()) {
//                     return true;
//                 }
//             }
//         }
//         return false;
//     },
//     updateDisabledDates: function (instance, disabledDates) {
//         // Example: Update disabled dates when the month changes
//         const newDisabledDates = [
//             {
//                 from: new Date("2024-08-10"),
//                 to: new Date("2024-08-15")
//             },
//             new Date("2024-08-25")
//         ];
//
//         instance.set('disable', newDisabledDates);
//     }
// };
//
// // Initial disabled dates
// const initialDisabledDates = [
//     {
//         from: new Date("2024-07-15"),
//         to: new Date("2024-07-22")
//     },
//     new Date("2024-07-29")
// ];
//
// // Initialize the calendar
// flatPickerCalendar.initialize(initialDisabledDates);
//
//

//
//
// /* /*
// Pasibandyt sita koda:
// let flatCalendar = {
//     initialize: function () {
//         $('#flatPickerCalendar').flatpickr({
//             mode: 'range', // Enables range selection
//             dateFormat: 'Y/m/d', // Date format
//             minDate: "today",
//             disableMobile: true, // Force Flatpickr to use its own picker on mobile devices
//             disable: [
//                 {
//                     from: "2024-07-15",
//                     to: "2024-07-22"
//                 },
//                 "2024-07-29",
//             ],
//             onChange: function (selectedDates, dateStr, instance) {
//                 if (selectedDates.length === 1) {
//                     let startDate = selectedDates[0];
//                     let furthestPossibleDate = calculateFurthestPossibleDate(startDate);
//
//                     // Disable all dates after the furthest possible date
//                     instance.set('disable', [
//                         {
//                             from: "2024-07-15",
//                             to: "2024-07-22"
//                         },
//                         "2024-07-29",
//                         { from: furthestPossibleDate ? new Date(furthestPossibleDate.getTime() + 86400000) : null }
//                     ]);
//                 } else if (selectedDates.length === 2) {
//                     console.log('Valid Date Range selected:', dateStr);
//                 }
//             }
//         });
//     }
// };
//
// function isDateDisabled(date) {
//     const disabledDates = [
//         {
//             from: new Date("2024-07-15"),
//             to: new Date("2024-07-22")
//         },
//         new Date("2024-07-29"),
//     ];
//
//     for (let entry of disabledDates) {
//         if (entry instanceof Object && entry.from && entry.to) {
//             if (date >= entry.from && date <= entry.to) {
//                 return true;
//             }
//         } else if (entry instanceof Date) {
//             if (date.toDateString() === entry.toDateString()) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }
//
// function calculateFurthestPossibleDate(startDate) {
//     let furthestDate = new Date(startDate);
//     for (let d = new Date(startDate); ; d.setDate(d.getDate() + 1)) {
//         if (isDateDisabled(d)) {
//             break;
//         }
//         furthestDate = new Date(d);
//     }
//     return furthestDate;
// }
//
// $(document).ready(function () {
//     console.log("public/js/test/testFlatPicker.js -> ready!");
//     flatCalendar.initialize();
// });
//
// Tuo paciu paziuret kaip veikia kalendorius kai uzloadinam pirma ant kompo viewo, ir tada pakeiciam i telefo
// Itariu kad gali veikti gerai
//  */
