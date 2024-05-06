/*https://fullcalendar.io/*/
$(document).ready(function () {
    console.log("/js/trampolines/private/trampolines_admin.js -> ready!");
    initCalendar()
});
let Calendar = null;
function initCalendar() {
    let calendarEl = document.getElementById('calendar');
    Calendar = new FullCalendar.Calendar(calendarEl, {
        initialDate: '2023-01-07',
        editable: true, // enable draggable events
        selectable: true,
        //aspectRatio: 1.8,
        headerToolbar: {
            left: 'promptTrampoline promptNewOrder today prev,next',
            center: 'title',
            right: 'resourceTimelineDay,resourceTimelineThreeDays,resourceTimelineSevenDays,timeGridWeek,dayGridMonth,listWeek'
        },
        initialView: 'resourceTimelineDay',
        views: {
            resourceTimelineThreeDays: {
                type: 'resourceTimeline',
                duration: { days: 3 },
                buttonText: '3 days'
            },
            resourceTimelineSevenDays: {
                type: 'resourceTimeline',
                duration: { days: 7 },
                buttonText: '7 days'
            }
        },
        resourceAreaHeaderContent: 'Batutai',
        resources: [
            { id: 'c', title: 'Battuas A',eventColor: 'blue' },
            { id: 'd', title: 'Battuas B', eventColor: 'red'},
            { id: 'e', title: 'Battuas C', eventColor: 'green' },
            { id: 'f', title: 'Battuas D', eventColor: 'orange' },
        ],
        events: [
            { id: '1', resourceId: 'a1', start: '2023-01-07T08:00:00', end: '2023-01-07T15:00:00', title: 'DBA465 | SCANIA XXL | UAB Autotransportas' },
            { id: '2', resourceId: 'a2', start: '2023-01-07T11:00:00', end: '2023-01-08T06:00:00', title: 'DBA895 | VOLVO TR | UAB Vairas' },
            { id: '3', resourceId: 'b1', start: '2023-01-07T09:00:00', end: '2023-01-07T14:00:00', title: 'FGH111 | VOLVO FG | UAB Vežėjas' },
            { id: '4', resourceId: 'b2', start: '2023-01-07T12:00:00', end: '2023-01-07T16:00:00', title: 'FGH111 | VOLVO FG | UAB Vežėjas' },
            { id: '5', resourceId: 'c', start: '2023-01-07T06:00:00', end: '2023-01-07T11:30:00', title: 'JJK111 | VOLVO TRUCK | UAB Vežėjas' },
            { id: '6', resourceId: 'd', start: '2023-01-07T06:00:00', end: '2023-01-07T11:30:00', title: 'JJK222 | MAN LARGE | UAB Ratukas' },
            { id: '7', resourceId: 'e', start: '2023-01-07T06:30:00', end: '2023-01-07T10:30:00', title: 'JJK222 | MAN LARGE | UAB Ratukas' },
            { id: '8', resourceId: 'f', start: '2023-01-07T10:30:00', end: '2023-01-07T14:30:00', title: 'JJK222 | MAN LARGE | UAB Ratukas' }
        ],
        select: function(arg) {
            console.log(
                'select callback',
                arg.startStr,
                arg.endStr,
                arg.resource ? arg.resource.id : '(no resource)'
            );
        },
        dateClick: function(arg) {
            console.log(
                'dateClick',
                arg.date,
                arg.resource ? arg.resource.id : '(no resource)'
            );
        },
        customButtons: {
            promptTrampoline: {
                text: '+ Batutas',
                click: function() {
                    let title = prompt('Batutas');
                    if (title) {
                        Calendar.addResource({ title: title });
                    }
                }
            },
            promptNewOrder: {
                text: '+ Naujas užsakymas',
                click: function() {
                    let name = prompt('Kliento vardas, pavarde');
                    let phone = prompt('Telefonas');
                    if (name && phone) {
                        Calendar.addEvent(
                            {id: '9', resourceId: 'c', start: '2023-01-07T10:30:00', end: '2023-01-07T14:30:00', title: name+'|'+phone}
                        );
                    }
                }
            }

        }
    });
    Calendar.render();
    /*$(window).resize(function() {
        console.log('Window resized '+window.innerHeight+'px X '+window.innerWidth+'px');
        document.getElementById('mainRow').setAttribute("style","height:"+(window.innerHeight - 56)+"px");
    });*/
    /*Calendar.select({
        start: '2023-01-07T02:00:00',
        end: '2023-01-07T07:00:00',
        resourceId: 'f'
    });*/
    //generateWorkers()

}
