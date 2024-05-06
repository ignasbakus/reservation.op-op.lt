let Calendar = null;
let Occupied = [
    {
        id : 1,
        title: "Uzimta",
        start: '2024-05-01 00:00:00',
        end: '2024-05-11 00:00:00',
        type_custom: 'occ'
    },
    {
        id : 2,
        title: 'Uzimta',
        start: '2024-05-14 00:00:00',
        end: '2024-05-17 00:00:00',
        type_custom: 'occ'
    },
    {
        id : 3,
        title: 'Uzimta',
        start: '2024-05-26 00:00:00',
        end: '2024-05-31 00:00:00',
        type_custom: 'occ'
    },
];

document.addEventListener('DOMContentLoaded', function() {
    Calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialDate: '2024-05-06',
        editable: true,
        selectable: true,
        // businessHours: true,
        dayMaxEvents: true,
        events: [
        ],
        eventAllow: function(dropInfo, draggedEvent) {
            console.log('dropInfo => ',dropInfo);
            console.log('draggedEvent => ',draggedEvent);
            console.log('draggedEvent dropInfo.start => ',dropInfo.start)
            console.log('draggedEvent dropInfo.end => ',dropInfo.end)
            let CouldBeDropped = true;
            Occupied.forEach(function (Occupation){
                let OccupationStart = new Date(Occupation.start)
                let OccupationEnd = new Date(Occupation.end)
                let dropStart = new Date(dropInfo.start)
                let dropEnd = new Date(dropInfo.end)
                if (dropStart >= OccupationStart && dropEnd <= OccupationEnd) {
                    console.log('Occupied !');
                    CouldBeDropped = false
                } else {
                    console.log('Available !');
                }
                /*if (dropStart >= OccupationStart || OccupationStart <= OccupationEnd) {
                    console.log('Occupied !');
                    CouldBeDropped = false
                } else {
                    console.log('Available !');
                }*/
            })
            return CouldBeDropped;
        }
    });
    Calendar.render();
    addOccupied()
    addEvent()
})

function addOccupied () {
    Occupied.forEach(function (Occupation){
        Occupation.title = 'Užimta'
        Occupation.backgroundColor = 'red'
        if (Occupation.type_custom === 'occ') {
            Occupation.editable = false
        }
        Calendar.addEvent(Occupation)
    })
}

function addEvent () {
    Calendar.addEvent(
        {
            id: 123,
            title: 'Batutas kiskutis',
            start: '2024-05-19',
            end: '2024-05-19',
        }
    )
}

let TrampolineOrder = {
    init: function () {
        this.Form.Event.init()
    },
    Form: {
        Event: {
            init: function () {
                $('#orderForm .orderSameDay').on('change', function() {
                    if (!$(this).is(':checked')) {
                        $('.showTrampolineSelect').show().click()
                    } else {
                        $('.showTrampolineSelect').hide();
                    }
                })
            }
        }
    }
}

$(document).ready(function () {
    console.log("/js/trampolines/public/order_public.js -> ready!");
    TrampolineOrder.init()
});
