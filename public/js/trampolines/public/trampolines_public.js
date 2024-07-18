let Actions = {
    InitActions: function () {
        ToolTip.init();
        Carousels.trampolinesCarousel.init();
        Carousels.trampolinesCarousel.ChosenTrampoline = firstTrampolineId
        Trampolines.init();
        Trampolines.SendOrder.Events.init();
        Trampolines.Modals.showTrampoline.Events.init();
    }
}
let ToolTip = {
    init: function () {
        if (window.innerWidth > 768) {
            let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
}

let Carousels = {
    trampolinesCarousel: {
        Carousel: new bootstrap.Carousel('#trampolinesCarousel', {
            keyboard: true,
            touch: true
        }),
        ChosenTrampoline: 0,
        init: function () {
            $('#trampolinesCarousel').on('slide.bs.carousel', event => {
                this.ChosenTrampoline = $(event.relatedTarget).data('trampolineid');
            })
            $('#selectTrampoline').on('click', () => {
                Trampolines.addToSelected(this.ChosenTrampoline);
            })
        },
    }
}

let Trampolines = {
    init: function () {
        this.updateNoTrampolinesMessage()
    },
    chosen: [],
    Modals: {
        showTrampoline: {
            descriptionChosenTrampoline: '',
            element: new bootstrap.Modal('#showTrampolineModal'),
            Events: {
                init: function () {
                    $('#showTrampolineModal').on('show.bs.modal', (event) => {
                        this.fetchDescription(event);
                    })
                    $('#showTrampolineModal .chooseTrampoline').on('click', (event) => {
                        event.stopPropagation();
                        Trampolines.addToSelected(Carousels.trampolinesCarousel.ChosenTrampoline);
                        Trampolines.Modals.showTrampoline.element.hide();
                    });
                },
                fetchDescription: function (event) {
                    const button = $(event.relatedTarget).closest('.carousel-item'); // Closest carousel item
                    const trampolineId = button.data('trampolineid'); // Extract info from data-* attributes
                    let trampoline = trampolinesFromDb.find(t => t.id === trampolineId);
                    let modalDescription = Trampolines.Modals.showTrampoline.element._element.querySelector('.modal-description h6');
                    modalDescription.textContent = trampoline.description;
                }
            }
        }
    },
    SendOrder: {
        Events: {
            init: function () {
                $('#sendToOrderButton').on('click', (event) => {
                    window.location.href = '/orders/public?' + $.param({
                        trampoline_id: Trampolines.chosen
                    });
                });
            }
        }
    },
    addToSelected: function (TrampolineID) {
        if (!this.chosen.includes(TrampolineID)) {
            this.chosen.push(TrampolineID);
        }
        this.updateOrderButtonState();
        this.getTrampolinesView();
    },
    removeFromSelected: function (TrampolineID) {
        let index = this.chosen.indexOf(TrampolineID);
        if (index !== -1) {
            this.chosen.splice(index, 1);
        }
        this.updateOrderButtonState();
        this.getTrampolinesView();
    },
    updateOrderButtonState: function () {
        if (this.chosen.length > 0) {
            $('#sendToOrderButton').show();
        } else {
            $('#sendToOrderButton').hide();
        }
    },
    updateNoTrampolinesMessage: function () {
        if (this.chosen.length === 0) {
            $('#SelectedTrampolines').html('<li class="list-group-item mt-3 no-trampolines-message">Nepasirinkote jokių batutų</li>');
        } else {
            $('#SelectedTrampolines .no-trampolines-message').remove();
        }
    },
    initEventsAfterHtmlUpdate: function () {
        $('.removeSelectedTrampoline').on('click', (event) => {
            event.stopPropagation();
            this.removeFromSelected($(event.currentTarget).data('trampolineid'));
        });
    },
    getTrampolinesView: function () {
        $('#overlay').css('display', 'flex');
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
            $('#overlay').hide();
            $('#SelectedTrampolines').html(response.view);
            this.initEventsAfterHtmlUpdate();
            this.updateNoTrampolinesMessage(); // Update message after rendering
        }).fail(function (jqXHR, textStatus) {
            alert("Request failed: " + textStatus);
        });
    }
};

$(document).ready(function () {
    console.log("/js/trampolines/public/trampolines_public.js -> ready!");
    Actions.InitActions();
    console.log('Trampolines from db: ', trampolinesFromDb)
});
