let Actions = {
    InitActions: function () {
        Carousels.trampolinesCarousel.init();
        Trampolines.init();
        Trampolines.SendOrder.Events.init();
        Trampolines.Modals.showTrampoline.Events.init();
    }
}

let Carousels = {
    trampolinesCarousel: {
        Carousel: new bootstrap.Carousel('#trampolinesCarousel', {
            keyboard: true,
            touch: true
        }),
        ChosenTrampoline: 1,
        init: function () {
            $('#trampolinesCarousel').on('slide.bs.carousel', event => {
                this.ChosenTrampoline = $(event.relatedTarget).data('trampolineid')
            })
            $('#selectTrampoline').on('click', () => {
                Trampolines.addToSelected(this.ChosenTrampoline)
            })
        }
    }
}

let Trampolines = {
    init: function () {
    },
    chosen: [],
    Modals: {
        showTrampoline: {
            element: new bootstrap.Modal('#showTrampolineModal'),
            Events: {
                init: function () {
                    $('#showTrampolineModal .chooseTrampoline').on('click', (event) => {
                        event.stopPropagation()
                        console.log("batuto id po paspaudimo: ", Carousels.trampolinesCarousel.ChosenTrampoline)
                        Trampolines.addToSelected(Carousels.trampolinesCarousel.ChosenTrampoline)
                        Trampolines.Modals.showTrampoline.element.hide()
                    })
                }
            }
        }
    },
    SendOrder: {
        Events: {
            init: function () {
                $('#sendToOrder').on('click', (event) => {
                    window.location.href = '/orders/public?' + $.param({
                        trampoline_id: Trampolines.chosen
                    });
                });
            }
        }
    },
    addToSelected: function (TrampolineID) {
        if (this.chosen.find((element) => element === TrampolineID) !== TrampolineID) {
            this.chosen.push(TrampolineID)
        }
        console.log('selected = ' + TrampolineID + ' | chosen trampolines => ', this.chosen)
        this.getTrampolinesView()
    },
    removeFromSelected: function (TrampolineID) {
        let findInChosen = this.chosen.findIndex((element) => element === TrampolineID)
        this.chosen.splice(findInChosen, 1)
        this.getTrampolinesView()
    },
    initEventsAfterHtmlUpdate: function () {
        $('.removeSelectedTrampoline').on('click', (event) => {
            event.stopPropagation()
            this.removeFromSelected($(event.currentTarget).data('trampolineid'))
        })
    },
    getTrampolinesView: function () {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            method: "POST",
            url: "/trampolines/public/render_selected_view",
            data: {
                chosenTrampolines: Trampolines.chosen
            }
        }).done((response) => {
            console.log("response : ", response);
            console.log(Trampolines.chosen)
            $('#SelectedTrampolines').html(response.view)
            this.initEventsAfterHtmlUpdate();
        }).fail(function (jqXHR, textStatus) {
            alert("Request failed: " + textStatus);
        });
    }
}


$(document).ready(function () {
    console.log("/js/trampolines/public/trampolines_public.js -> ready!");
    Actions.InitActions();
});
